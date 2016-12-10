import WEB3_API from './web3Api';
import * as web3Actions from './actions/web3';
import * as contractActions from './actions/contracts';
// import * as transactionActions from './actions/transactions';
const { getWeb3Method } = web3Actions;
const { createTransaction } = contractActions;

export function reduxifyWeb3({ web3 }) {
  const api = {};
  Object.keys(WEB3_API).forEach((key) => {
    const keys = key.split('.');
    const groupKey = keys[0];
    const methodKey = keys[1];
    if (!api[groupKey]) { api[groupKey] = {}; }
    const method = web3[groupKey][methodKey];
    const actionNames = WEB3_API[key].actions || web3Actions.actions;
    api[groupKey][methodKey] = (...args) => {
      return getWeb3Method({ key, method, args, actionNames });
    };
  });
  return api;
}

export function reduxifyContract({ abi, address, web3 }) {
  if (!address) { throw new Error('Address not defined'); }
  const contract = web3.eth.contract(abi).at(address);
  const api = {};
  abi.forEach((definition) => {
    if (definition.type !== 'function') { return; }
    api[definition.name] = {};

    // TODO pass getEventMethod()
    // TODO pass new()

    // hook up transactions
    api[definition.name] = (...args) => {
      return createTransaction({ args, address, method: contract[definition.name] });
    };

    // hook up calls
    const callKey = [address, 'calls', definition.name].join('.');
    api[definition.name].call = (...args) => {
      return getWeb3Method({ args, key: callKey, method: contract[definition.name].call, actionNames: contractActions.actions });
    };
  });
  return api;
}
