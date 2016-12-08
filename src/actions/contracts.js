import { NAMESPACE } from '../constants';
import { getWeb3Method } from './web3';

export const actions = {
  DEPLOYING: `${NAMESPACE} deploying contract`,
  DEPLOYED: `${NAMESPACE} deployed contract`,
  GETTING: `${NAMESPACE} getting contract method`,
  GOT: `${NAMESPACE} got contract method`,
  FAILED: `${NAMESPACE} failed to get contract method`,
};

export function deployContract() {

}

export function contractReduxMethods({ abi, address, web3 }) {
  if (!address) { throw new Error('Address not defined'); }
  const contract = web3.eth.contract(abi).at(address);
  const api = {};
  abi.forEach((definition) => {
    if (definition.type !== 'function') { return; }
    api[definition.name] = {};
    ['transaction', 'call'].forEach((type) => {
      const key = [address, definition.name, type].join('.');
      const method = type === 'call' ? contract[definition.name].call : contract[definition.name];
      api[definition.name][type] = (...args) => {
        return getWeb3Method({ key, method, args, actionNames: actions });
      };
    });
  });
  return api;
}
