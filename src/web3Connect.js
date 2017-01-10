/* eslint-disable no-underscore-dangle */

// TODO figure out caching

import merge from 'deepmerge';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import WEB3_API from './web3Api';
import { getWeb3Method, createContractTransaction } from './actions';

function reduxifyWeb3({ web3, networkId }) {
  const api = {};
  Object.keys(WEB3_API).forEach((key) => {
    const keys = key.split('.');
    const groupKey = keys[0];
    const methodKey = keys[1];
    if (!api[groupKey]) { api[groupKey] = {}; }
    const method = web3[groupKey][methodKey];
    const collection = WEB3_API[key].collection || 'web3';
    const actionCreator = WEB3_API[key].actionCreator || getWeb3Method;
    api[groupKey][methodKey] = (...args) => {
      return actionCreator({ collection, key, method, args, networkId });
    };
  });
  return api;
}

function reduxifyContract({ abi, address, web3, networkId, getStore }) {
  if (!address) { throw new Error('Address not defined'); }
  const contractInstance = (web3.__web3 || web3).eth.contract(abi).at(address);
  const api = {};
  // TODO optimize/cache?
  abi.forEach((definition) => {
    if (definition.type !== 'function') { return; }
    api[definition.name] = {};

    // standard getter
    api[definition.name] = (...args) => {
      return (getStore().getIn(['web3Redux', 'networks', networkId, 'contracts', address, 'calls', definition.name, JSON.stringify(args)]) || {}).value;
    };
    // hook up transactions
    api[definition.name].transaction = (...args) => {
      return createContractTransaction({ networkId, args, address, method: contractInstance[definition.name] });
    };
    // hook up calls
    const callKey = ['calls', definition.name].join('.');
    api[definition.name].call = (...args) => {
      return getWeb3Method({ networkId, args, address, collection: 'contracts', key: callKey, method: contractInstance[definition.name].call });
    };
  });
  return api;
}

const cachedContracts = {};

function generateContractAPI({ abi, address, networkId, getStore, getDispatch, web3 }) {
  if (!web3) { return null; }
  // TODO use provider url, too (hint, yes.)?
  const cacheKey = `${networkId}${address}`;
  if (cachedContracts[cacheKey]) { return cachedContracts[cacheKey]; }
  const contractRedux = reduxifyContract({ abi, address, web3, networkId, getStore });
  // bind action creators for `call` and `transaction`
  const api = Object.keys(contractRedux).reduce((o, k) => {
    const { transaction, call } = contractRedux[k];
    const actions = bindActionCreators({ transaction, call }, getDispatch());
    const wrappedMethod = contractRedux[k];
    wrappedMethod.transaction = actions.transaction;
    wrappedMethod.call = actions.call;
    return { ...o, [k]: wrappedMethod };
  }, {});
  cachedContracts[cacheKey] = api;
  return { ...api, __web3: web3.__web3 || web3 };
}

function generateWeb3API({ network, getStore, getDispatch, web3 }) {
  const networkId = network.id;
  if (!web3) { return null; }
  const web3Redux = reduxifyWeb3({ networkId, web3 });
  const api = merge(
    Object.keys(web3Redux).reduce((o, k) => ({
      ...o, [k]: Object.keys(web3Redux[k]).reduce((o2, k2) => {
        if (k2.indexOf('get') !== 0) { return o2; }
        const getterMethod = k2.split('get')[1];
        const getterKey = `${getterMethod[0].toLowerCase()}${getterMethod.slice(1)}`;
        const getterFn = (...args) => {
          const gotStore = getStore();
          if (!gotStore) { return null; }
          if (getterKey === 'transaction') {
            return (gotStore.getIn(['web3Redux', 'networks', networkId, 'transactions', args[0]]) || {}).value;
          }
          return (gotStore.getIn(['web3Redux', 'networks', networkId, 'web3', k, k2, JSON.stringify(args)]) || {}).value;
        };
        return { ...o2, [getterKey]: getterFn };
      }, {}),
    }), {})
  ,
    Object.keys(web3Redux).reduce((o, k) => ({
      ...o, [k]: bindActionCreators(web3Redux[k], getDispatch()),
    }), {})
  );

  const contract = (abi) => {
    return {
      at: (address) => generateContractAPI({ abi, address, networkId, getStore, getDispatch, web3 }),
      new: () => {
        // TODO deploy new contract instance...
      },
    };
  };

  return {
    ...api,
    __web3: web3,
    eth: {
      ...api.eth,
      contract,
    },
  };
}

export default function (arg) {
  // const web3s;
  // use store/dispatch pointer and cache reducer in this namespace for perf & getter syntax
  let store;
  let dispatch;
  let resolvedWeb3;
  function getStore() { return store; }
  function getDispatch() { return dispatch; }

  function resolveWeb3() {
    if (resolvedWeb3) {
      return resolvedWeb3;
    }
    if (typeof arg === 'function') {
      return arg({ getStore, getDispatch, generateWeb3API });
    }
    resolvedWeb3 = (typeof arg !== 'function') && Object.keys(arg).reduce((o, k) => ({
      ...o, [k]: generateWeb3API({ network: { id: k }, web3: arg[k], getStore, getDispatch }),
    }), {});
    return resolvedWeb3;
  }

  function mapStateToProps(newStore) {
    store = newStore;
    const obj = store.get('web3Redux');
    const web3ReduxStore = obj && obj.toJS() || {};
    return { web3ReduxStore };
  }

  function mapDispatchToProps(newDispatch) {
    dispatch = newDispatch;
    return {};
  }

  function mergeProps(stateProps, dispatchProps, ownProps) {
    return {
      ...ownProps,
      ...stateProps,
      web3s: resolveWeb3(),
      status: store.getIn(['web3Redux', 'status']) || {},
    };
  }

  return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}
