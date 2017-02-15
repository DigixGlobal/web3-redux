import { bindActionCreators } from 'redux';
import { callContractMethod, createContractTransaction } from './actions';
import { degrade, getMethodKey } from './helpers';

export default function ({ abi, address, networkId, getState, dispatch, web3 }) {
  // cached version doesn't exist, create it
  const contractInstance = web3.eth.contract(abi).at(address);
  // // reduce the abi into the redux methods
  const api = abi.reduce((o, definition) => {
    // skip if we're not dealing with a function
    if (definition.type !== 'function') { return o; }
    const methodName = definition.name;
    // base getter
    const contractMethod = (...args) => {
      return degrade(() => getState().networks[networkId].contracts[address].calls[getMethodKey({ methodName, args })].value);
    };
    // hook up calls
    const call = (...args) => callContractMethod({ networkId, args, address, method: contractInstance[definition.name].call });
    // hook up transactions
    const sendTransaction = (...args) => createContractTransaction({ networkId, args, address, method: contractInstance[methodName] });
    // // buid the actions
    const actions = bindActionCreators({ sendTransaction, call }, dispatch);
    contractMethod.call = actions.call;
    contractMethod.transaction = actions.transaction;
    // // reduce with added actions
    return { ...o, [methodName]: contractMethod };
  }, {});
  // decorate
  api.address = address;
  return api;
}
