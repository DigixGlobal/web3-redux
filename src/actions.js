import { networkApis } from './generateNetworkApi';

const NAMESPACE = 'web3-redux';

export const actions = {
  XHR: `${NAMESPACE} xhr update`,
  NETWORK_SET_WEB3: `${NAMESPACE} network set web3`,
  NETWORK_REMOVED: `${NAMESPACE} network removed`,
  WEB3_METHOD_SUCCESS: `${NAMESPACE} web3 method success`,
  TRANSACTION_UPDATED: `${NAMESPACE} transaction updated`,
  CONTRACT_METHOD_SUCCESS: `${NAMESPACE} contract method success`,
  CONTRACT_TRANSACTION_CREATED: `${NAMESPACE} contract transaction created`,
};

function removeWeb3(networkId) {
  if (networkApis[networkId]) {
    if (networkApis[networkId].web3) {
      networkApis[networkId].web3.reset();
    }
    delete networkApis[networkId];
  }
}

export function setNetwork({ networkId, web3, getDefaultAddress }) {
  removeWeb3(networkId);
  networkApis[networkId] = { web3, getDefaultAddress };
  return { type: actions.NETWORK_SET_WEB3, networkId, payload: { enabled: !!web3, connecting: !!web3 } };
}

export function updateNetwork({ networkId, payload }) {
  return { type: actions.NETWORK_SET_WEB3, networkId, payload };
}

export function removeNetwork({ networkId }) {
  removeWeb3(networkId);
  return { type: actions.NETWORK_REMOVED, networkId };
}

export function decorateTransactionArgs({ args = [], networkId }) {
  const { getDefaultAddress } = networkApis[networkId];
  // if getter isn't set, do nothign
  if (!getDefaultAddress) {
    return args;
  }
  // if the last argument already sets `from`, do nothing
  const lastArg = args[args.length - 1] || {};
  if (lastArg.from) {
    return args;
  }
  // if the default address isn't gettable
  const from = getDefaultAddress();
  if (!from) {
    return args;
  }
  // if the last argument isn't an object (or is a big number), concat the `from`
  if (typeof lastArg !== 'object' || lastArg.constructor && lastArg.constructor.name === 'BigNumber') {
    return args.concat([{ from }]);
  }
  // otherwise, merge `from` into the last arg
  return args.slice(0, -1).concat([{ ...lastArg, from }]);
}

function callMethod({ method, args, networkId, transaction }, callback) {
  const decoratedArgs = transaction ? decorateTransactionArgs({ args, networkId }) : args;
  return (dispatch) => {
    dispatch({ type: actions.XHR, networkId, count: 1 });
    return new Promise((resolve, reject) => {
      try {
        method(...decoratedArgs, (err, value) => {
          if (err) {
            dispatch({ type: actions.XHR, networkId, count: -1 });
            return reject(err);
          }
          dispatch({ type: actions.XHR, networkId, count: -1 });
          callback({ dispatch, value });
          return resolve(value);
        });
      } catch (err) {
        dispatch({ type: actions.XHR, networkId, count: -1 });
        reject(err);
      }
    });
  };
}

export function web3Method({ method, networkId, args, key }) {
  return callMethod({ method, args, networkId }, ({ dispatch, value }) => {
    dispatch({ type: actions.WEB3_METHOD_SUCCESS, networkId, key, payload: { value, updated: new Date() } });
  });
}

export function getTransaction({ args, method, networkId }) {
  return callMethod({ method, args, networkId }, ({ dispatch, value }) => {
    dispatch({ type: actions.TRANSACTION_UPDATED, networkId, key: args[0], payload: { value, updated: new Date() } });
  });
}

export function createTransaction({ args, method, networkId }) {
  return callMethod({ method, args, networkId, transaction: true }, ({ dispatch, value }) => {
    dispatch({ type: actions.TRANSACTION_UPDATED, networkId, key: value, payload: { created: new Date() } });
  });
}

export function callContractMethod({ networkId, key, args, address, method }) {
  return callMethod({ method, args, networkId }, ({ dispatch, value }) => {
    dispatch({ type: actions.CONTRACT_METHOD_SUCCESS, address, networkId, key, payload: { value, updated: new Date() } });
  });
}
export function createContractTransaction({ networkId, args, address, method }) {
  return callMethod({ method, args, networkId, transaction: true }, ({ dispatch, value }) => {
    dispatch({ type: actions.TRANSACTION_UPDATED, networkId, key: value, payload: { created: new Date() } });
    dispatch({ type: actions.CONTRACT_TRANSACTION_CREATED, address, networkId, payload: { value } }); // relational
  });
}
