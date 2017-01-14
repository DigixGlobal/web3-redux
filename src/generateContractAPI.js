import { bindActionCreators } from 'redux';
import { getWeb3Method, createContractTransaction } from './actions';

export default function ({ abi, address, networkId, getStore, getDispatch, web3 }) {
  if (!address) { throw new Error('Address not defined'); }
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
  // decorate
  contractRedux.address = address;
  contractRedux.__web3 = web3.__web3 || web3;
  return contractRedux;
}
