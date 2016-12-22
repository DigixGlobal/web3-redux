import merge from 'deepmerge';
import { bindActionCreators } from 'redux';
import { reduxifyWeb3 } from './reduxifier';

function generateAPI({ network, getStore, dispatch, web3 }) {
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
      ...o, [k]: bindActionCreators(web3Redux[k], (...args) => dispatch(...args)),
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
    return { ...ownProps, ...stateProps, web3: getWeb3s({ getStore: () => store, dispatch, generateAPI }) };
  }
  return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}
