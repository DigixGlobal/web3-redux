import uuid from 'uuid';

const NAMESPACE = 'WEB_REDUX';

export const actions = {
  TRANSACTION_CREATED: `${NAMESPACE} created transaction`,
  CONTRACT_UPDATED_TRANSACTION: `${NAMESPACE} updated contract transaction status`,
  WEB3_GET: `${NAMESPACE} getting web3 method`,
  WEB3_GOT: `${NAMESPACE} got web3 method`,
  WEB3_GET_FAILED: `${NAMESPACE} failed to get web3 method`,
};

export function getWeb3Method({ method, key, args = [], collection, address, txHash }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: actions.WEB3_GET, key, args, collection, address, txHash });
      method.apply(null, args.concat([(err, res) => {
        if (err) {
          dispatch({ type: actions.WEB3_GET_FAILED, key, args, error: err, collection, address, txHash });
          return reject(err);
        }
        dispatch({ type: actions.WEB3_GOT, key, args, value: res, collection, address, txHash });
        return resolve(res);
      }]));
    });
  };
}

export function getTransaction({ collection, key, method, args }) {
  return getWeb3Method({ collection, key, method, args, txHash: args[0] });
}

export function createTransaction({ args, method }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      method.apply(null, args.concat([(err, txHash) => {
        if (err) { return reject(err); }
        dispatch({ collection: 'transactions', type: actions.TRANSACTION_CREATED, txHash, created: new Date() });
        return resolve(txHash);
      }]));
    });
  };
}

export function createContractTransaction({ args, method, address }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      const id = uuid();
      dispatch({ collection: 'contracts', type: actions.CONTRACT_UPDATED_TRANSACTION, id, address, payload: {} });
      return createTransaction({ args, method })(dispatch)
      .then((txHash) => {
        dispatch({ collection: 'contracts', type: actions.CONTRACT_UPDATED_TRANSACTION, id, address, payload: { txHash } });
        resolve(id);
      })
      .catch((error) => {
        dispatch({ collection: 'contracts', type: actions.CONTRACT_UPDATED_TRANSACTION, id, address, payload: { error } });
        reject(error);
      });
    });
  };
}
