import uuid from 'uuid';

const NAMESPACE = 'WEB3_REDUX';

export const actions = {
  TRANSACTION_CREATED: `${NAMESPACE} created transaction`,
  CONTRACT_UPDATED_TRANSACTION: `${NAMESPACE} updated contract transaction status`,
  WEB3_GET: `${NAMESPACE} getting web3 method`,
  WEB3_GOT: `${NAMESPACE} got web3 method`,
  WEB3_GET_FAILED: `${NAMESPACE} failed to get web3 method`,
  STATUS: `${NAMESPACE} status update`,
  WEB3_INIT: `${NAMESPACE} initialized`,
};

export function getWeb3Method({ method, args = [], ...params }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: actions.WEB3_GET, args, ...params });
      method(...args, (err, res) => {
        if (err) {
          dispatch({ type: actions.WEB3_GET_FAILED, args, error: err, ...params });
          return reject(err);
        }
        dispatch({ type: actions.WEB3_GOT, args, value: res, ...params });
        return resolve(res);
      });
    });
  };
}

export function getTransaction({ args, ...params }) {
  return getWeb3Method({ args, txHash: args[0], ...params });
}

export function createTransaction({ args, method, networkId }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      method.apply(null, args.concat([(err, txHash) => {
        if (err) { return reject(err); }
        dispatch({ networkId, txHash, collection: 'transactions', type: actions.TRANSACTION_CREATED, created: new Date() });
        return resolve(txHash);
      }]));
    });
  };
}

export function createContractTransaction({ args, method, address, networkId }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      const id = uuid();
      dispatch({ collection: 'contracts', type: actions.CONTRACT_UPDATED_TRANSACTION, id, networkId, address, payload: {} });
      return createTransaction({ args, method, networkId })(dispatch)
      .then((txHash) => {
        dispatch({ collection: 'contracts', type: actions.CONTRACT_UPDATED_TRANSACTION, id, networkId, address, payload: { txHash } });
        resolve(txHash);
      })
      .catch((error) => {
        dispatch({ collection: 'contracts', type: actions.CONTRACT_UPDATED_TRANSACTION, id, networkId, address, payload: { error } });
        reject(error);
      });
    });
  };
}
