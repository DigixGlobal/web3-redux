import { networkApis } from './generateNetworkApi';

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

// TODO handle errors
function callMethod({ method, args }, callback) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      try {
        method(...args, (err, value) => {
          if (err) { return reject(err); }
          callback({ dispatch, value });
          return resolve(value);
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}

export function web3Method({ method, key, networkId, args }) {
  const type = actions.WEB3_METHOD_SUCCESS;
  return callMethod({ method, args }, ({ dispatch, value }) => {
    dispatch({ type, networkId, key, payload: { value, updated: new Date() } });
  });
}

export function getTransaction({ args, method, networkId }) {
  const type = actions.TRANSACTION_UPDATED;
  return callMethod({ method, args }, ({ dispatch, value }) => {
    return dispatch({ type, networkId, key: args[0], payload: { value, updated: new Date() } });
  });
}

export function createTransaction({ args, method, networkId }) {
  const type = actions.TRANSACTION_UPDATED;
  return callMethod({ method, args }, ({ dispatch, value }) => {
    return dispatch({ type, networkId, key: value, payload: { created: new Date() } });
  });
}

// TODO implement
// callContractMethod
// createContractTransaction
