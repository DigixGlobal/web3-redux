import WEB3_API from './web3Api';
import { getWeb3Method, createContractTransaction } from './actions';

export function reduxifyWeb3({ web3 }) {
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
      return actionCreator({ collection, key, method, args });
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

    // TODO events

    // TODO new (deploy)

    // hook up transactions
    api[definition.name] = (...args) => {
      return createContractTransaction({ args, address, method: contract[definition.name] });
    };

    // hook up calls
    const callKey = ['calls', definition.name].join('.');
    api[definition.name].call = (...args) => {
      return getWeb3Method({ args, address, collection: 'contracts', key: callKey, method: contract[definition.name].call });
    };
  });
  return api;
}
