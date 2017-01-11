import merge from 'deepmerge';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import WEB3_API from './web3Api';
import { getWeb3Method, createContractTransaction } from './actions';

const cachedContracts = {};

function generateContractAPI({ abi, address, networkId, getStore, getDispatch, web3 }) {
  if (!address) { throw new Error('Address not defined'); }
  const cacheKey = `${networkId}${address}`;
  // return the cached version if it exists
  if (cachedContracts[cacheKey]) { return cachedContracts[cacheKey]; }
  // cached version doesn't exist, create it
  const contractInstance = (web3.__web3 || web3).eth.contract(abi).at(address);
  // reduce the abi into the redux methods
  const contractRedux = abi.reduce((o, definition) => {
    // skip if we're not dealing with a function
    if (definition.type !== 'function') { return o; }
    // standard getter
    const reduxMethod = (...args) => (getStore().getIn(['web3Redux', 'networks', networkId, 'contracts', address, 'calls', definition.name, JSON.stringify(args)]) || {}).value;
    // hook up transactions
    const transaction = (...args) => createContractTransaction({ networkId, args, address, method: contractInstance[definition.name] });
    // hook up calls
    const callKey = ['calls', definition.name].join('.');
    const call = (...args) => getWeb3Method({ networkId, args, address, collection: 'contracts', key: callKey, method: contractInstance[definition.name].call });
    // buid the actions
    const actions = bindActionCreators({ transaction, call }, getDispatch());
    reduxMethod.call = actions.call;
    reduxMethod.transaction = actions.transaction;
    // reduce with added actions
    return { ...o, [definition.name]: reduxMethod };
  }, {});
  // save the cache and return it
  cachedContracts[cacheKey] = { ...contractRedux, __web3: web3.__web3 || web3 };
  return cachedContracts[cacheKey];
}

function generateWeb3API({ network, getStore, getDispatch, web3 }) {
  const networkId = network.id;
  if (!web3) { return null; }
  const web3Redux = {};
  // TODO better refactoring
  Object.keys(WEB3_API).forEach((key) => {
    const keys = key.split('.');
    const groupKey = keys[0];
    const methodKey = keys[1];
    if (!web3Redux[groupKey]) { web3Redux[groupKey] = {}; }
    const method = web3[groupKey][methodKey];
    const collection = WEB3_API[key].collection || 'web3';
    const actionCreator = WEB3_API[key].actionCreator || getWeb3Method;
    web3Redux[groupKey][methodKey] = (...args) => {
      return actionCreator({ collection, key, method, args, networkId });
    };
  });
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
  // for accessing raw web3
  api.__web3 = web3;
  // pass a tx, wait for it to be mined
  api.eth.waitForMined = (tx, pollTime = 10 * 1000) => {
    return new Promise((resolve, reject) => {
      function poll() {
        return api.eth.getTransactionReceipt(tx).then((res) => {
          if (res) {
            resolve(res);
          } else {
            setTimeout(poll, pollTime);
          }
        }).catch(reject);
      }
      poll();
    });
  };
  // deploy / get contract instances
  api.eth.contract = (abi) => {
    return {
      at: (address) => generateContractAPI({ abi, address, networkId, getStore, getDispatch, web3 }),
      // deply new
      new: (...params) => {
        const instance = web3.eth.contract(abi);
        const args = params;
        const { data, ...rest } = args[args.length - 1];
        args[args.length] = { data };
        const newData = instance.new.getData.apply(instance, args);
        args[args.length] = { ...rest, data: newData };
        // TODO return the contract itself?
        return api.eth.sendTransaction.apply(null, args).then(tx => api.eth.waitForMined(tx));
      },
    };
  };
  return api;
}

export default function (arg) {
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
