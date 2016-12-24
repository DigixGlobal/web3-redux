import merge from 'deepmerge';
import { bindActionCreators } from 'redux';

import WEB3_API from './web3Api';
import { getWeb3Method } from './actions';

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

function generateAPI({ network, getStore, getDispatch, web3 }) {
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
          return gotStore && (gotStore.getIn(['web3Redux', networkId, 'web3', k, k2, JSON.stringify(args)]) || {}).value;
        };
        return { ...o2, [getterKey]: getterFn };
      }, {}),
    }), {})
  ,
    Object.keys(web3Redux).reduce((o, k) => ({
      ...o, [k]: bindActionCreators(web3Redux[k], getDispatch()),
    }), {})
  );
  return { ...api, __web3: web3 };
}

export default function ({ connect, getWeb3s }) {
  // use store/dispatch pointer and cache reducer in this namespace for perf & getter syntax
  let store;
  let dispatch;

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
    return { ...ownProps, ...stateProps, web3: getWeb3s({ getStore: () => store, getDispatch: () => dispatch, generateAPI }) };
  }
  return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}
