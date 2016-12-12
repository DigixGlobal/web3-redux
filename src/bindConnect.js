import merge from 'deepmerge';
import { bindActionCreators } from 'redux';
import { reduxifyWeb3 } from './reduxifier';

// TODO add contracts

export default function ({ connect, web3, networkId = 'default' }) {
  const web3Redux = reduxifyWeb3({ networkId, web3 });
  // use store/dispatch pointer and cache reducer in this namespace for perf
  let store;
  let dispatch;
  const web3ActionsAndGetters = merge(
    Object.keys(web3Redux).reduce((o, k) => ({
      ...o, [k]: Object.keys(web3Redux[k]).reduce((o2, k2) => {
        if (k2.indexOf('get') !== 0) { return o2; }
        const getterMethod = k2.split('get')[1];
        const getterKey = `${getterMethod[0].toLowerCase()}${getterMethod.slice(1)}`;
        const getterFn = (...args) => {
          return (store.getIn(['web3Redux', networkId, 'web3', k, k2, JSON.stringify(args)]) || {}).value;
        };
        return { ...o2, [getterKey]: getterFn };
      }, {}),
    }), {})
  ,
    Object.keys(web3Redux).reduce((o, k) => ({
      ...o, [k]: bindActionCreators(web3Redux[k], (...args) => dispatch(...args)),
    }), {})
  );

  function mapStateToProps(newStore) {
    store = newStore;
    const obj = store.getIn(['web3Redux', networkId]);
    const web3ReduxStore = obj && obj.toObject() || {};
    return { web3ReduxStore };
  }

  function mapDispatchToProps(newDispatch) {
    dispatch = newDispatch;
    return {};
  }

  function mergeProps(stateProps, dispatchProps, ownProps) {
    return { ...ownProps, ...stateProps, web3: web3ActionsAndGetters };
  }
  return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}
