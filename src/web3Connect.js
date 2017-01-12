import { connect } from 'react-redux';

import generateWeb3API from './generateWeb3API';

export default function (arg) {
  let store;
  let dispatch;
  let resolvedWeb3;
  function getStore() { return store; }
  function getDispatch() { return dispatch; }
  // todo document
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
    // TODO optimize?
    const web3ReduxStore = obj && obj.toJS() || {};
    return { web3ReduxStore };
  }
  function mapDispatchToProps(newDispatch) {
    dispatch = newDispatch;
    return {};
  }
  function mergeProps(stateProps, dispatchProps, ownProps) {
    const { web3ReduxStore, ...rest } = stateProps;
    return {
      ...ownProps,
      ...rest,
      web3Redux: {
        networks: resolveWeb3(),
        status: store.getIn(['web3Redux', 'status']) || {},
      },
    };
  }
  return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}
