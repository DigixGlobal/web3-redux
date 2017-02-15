import { networkApis } from './generateNetworkApi';
import { getMethodKey } from './helpers';

const NAMESPACE = 'web3-redux';

export const actions = {
  NETWORK_SET_WEB3: `${NAMESPACE} network set web3`,
  NETWORK_REMOVED: `${NAMESPACE} network removed`,
  WEB3_METHOD_SUCCESS: `${NAMESPACE} web3 method success`,
  TRANSACTION_CREATED: `${NAMESPACE} transaction created`,
  // TODO implement
  // WEB3_METHOD_DISPATCHED: `${NAMESPACE} web3 method dispatched`,
  // WEB3_METHOD_ERROR: `${NAMESPACE} web3 method error`,
};

function removeWeb3(networkId) {
  // TODO cancel ajax
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

export function web3Method({ groupName, methodName, networkId, args }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      const key = getMethodKey({ groupName, methodName, args });
      try {
        // TODO implement
        // dispatch({ type: actions.WEB3_METHOD_DISPATCHED, networkId, key });
        networkApis[networkId].web3[groupName][methodName](...args, (err, value) => {
          // TODO serialize value?
          if (err) {
            // dispatch({ type: actions.WEB3_METHOD_ERROR, networkId, key, payload: { err } });
            return reject(err);
          }
          dispatch({ type: actions.WEB3_METHOD_SUCCESS, networkId, key, payload: { value } });
          return resolve(value);
        });
      } catch (err) {
        // dispatch({ type: actions.WEB3_METHOD_ERROR, networkId, key, payload: { err } });
        reject(err);
      }
    });
  };
}

export function createTransaction({ args, groupName, methodName, networkId }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      // TODO implement dispatch/error actions?
      try {
        networkApis[networkId].web3[groupName][methodName](...args, (err, txHash) => {
          if (err) { return reject(err); }
          dispatch({ type: actions.TRANSACTION_CREATED, networkId, key: txHash, payload: { created: new Date() } });
          return resolve(txHash);
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}
