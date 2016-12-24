import { bindActionCreators } from 'redux';
import { getWeb3Method, createContractTransaction } from './actions';

const cached = {}

function reduxifyContract({ abi, address, web3, networkId, getStore }) {
  if (!address) { throw new Error('Address not defined'); }
  const contractInstance = (web3.__web3 || web3).eth.contract(abi).at(address);
  const api = {};
  // TODO optimize/cache?
  abi.forEach((definition) => {
    if (definition.type !== 'function') { return; }
    api[definition.name] = {};

    // TODO new (deploy)

    // standard getter
    api[definition.name] = (...args) => {
      return (getStore().getIn(['web3Redux', networkId, 'contracts', address, 'calls', definition.name, JSON.stringify(args)]) || {}).value;
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

function generateContractAPI({ abi, address, networkId, getStore, getDispatch, web3 }) {
  if (!web3) { return null; }
  // TODO use provider url, too?
  const cacheKey = `${networkId}${address}`;
  if (cached[cacheKey]) { return cached[cacheKey]; }
  const contractRedux = reduxifyContract({ abi, address, web3, networkId, getStore });
  // bind action creators for `call` and `transaction`
  const api = Object.keys(contractRedux).reduce((o, k) => {
    const { transaction, call } = contractRedux[k]
    const actions = bindActionCreators({ transaction, call }, getDispatch());
    const wrappedMethod = contractRedux[k];
    wrappedMethod.transaction = actions.transaction;
    wrappedMethod.call = actions.call;
    return { ...o, [k]: wrappedMethod };
  }, {});
  cached[cacheKey] = api;
  return { ...api, __web3: web3.__web3 || web3 };
}

export default function ({ connect, getContracts }) {
  // use store/dispatch pointer and cache reducer in this namespace for perf & getter syntax
  let store;
  let dispatch;

  function mapStateToProps(newStore) {
    store = newStore;
    const obj = store.get('web3Redux'); // TODO make it more specific
    const web3ReduxStore = obj && obj.toJS() || {};
    return { web3ReduxStore };
  }

  function mapDispatchToProps(newDispatch) {
    dispatch = newDispatch;
    return {};
  }

  function mergeProps(stateProps, dispatchProps, ownProps) {
    return { ...ownProps, ...stateProps, contracts: getContracts({
      getStore: () => store,
      getDispatch: () => dispatch,
      generateContractAPI, ownProps,
    }) };
  }
  return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}
