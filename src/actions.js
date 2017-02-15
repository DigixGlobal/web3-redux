import { networkApis } from './generateNetworkApi';
import { getMethodKey } from './helpers';

const NAMESPACE = 'web3-redux';

export const actions = {
  NETWORK_SET_WEB3: `${NAMESPACE} network set web3`,
  NETWORK_REMOVED: `${NAMESPACE} network removed`,
  WEB3_METHOD_SUCCESS: `${NAMESPACE} web3 method success`,
  TRANSACTION_UPDATED: `${NAMESPACE} transaction updated`,
};

function removeWeb3(networkId) {
  if (networkApis[networkId]) {
    if (networkApis[networkId].web3) {
      networkApis[networkId].web3.reset();
    }
    delete networkApis[networkId];
  }
}

export function setNetwork({ networkId, web3 }) {
  removeWeb3(networkId);
  networkApis[networkId] = { web3 };
  return { type: actions.NETWORK_SET_WEB3, networkId, payload: { enabled: !!web3 } };
}

export function removeNetwork({ networkId }) {
  removeWeb3(networkId);
  return { type: actions.NETWORK_REMOVED, networkId };
}

export function web3Method({ groupName, methodName, networkId, args, actionName, keyName }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      const key = keyName || getMethodKey({ groupName, methodName, args });
      const type = actionName || actions.WEB3_METHOD_SUCCESS;
      try {
        networkApis[networkId].web3[groupName][methodName](...args, (err, value) => {
          if (err) { return reject(err); }
          dispatch({ type, networkId, key, payload: { value, updated: new Date() } });
          return resolve(value);
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}

export function getTransaction({ args, ...rest }) {
  return web3Method({ ...rest, args, keyName: args[0], actionName: actions.TRANSACTION_UPDATED });
}

export function createTransaction({ args, groupName, methodName, networkId }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      try {
        networkApis[networkId].web3[groupName][methodName](...args, (err, txHash) => {
          if (err) { return reject(err); }
          dispatch({ type: actions.TRANSACTION_UPDATED, networkId, key: txHash, payload: { created: new Date() } });
          return resolve(txHash);
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}

// TODO implement
// callContractMethod,
// createContractTransaction
