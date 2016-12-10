import uuid from 'uuid';
import { NAMESPACE } from '../constants';
import * as txActions from './transactions';

export const actions = {
  DEPLOYING: `${NAMESPACE} deploying contract`,
  DEPLOYED: `${NAMESPACE} deployed contract`,
  UPDATED_TRANSACTION: `${NAMESPACE} updated contract transaction status`,
  GETTING: `${NAMESPACE} getting contract method`,
  GOT: `${NAMESPACE} got contract method`,
  FAILED: `${NAMESPACE} failed to get contract method`,
};

export function createTransaction({ args, method, address }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      const id = uuid();
      dispatch({ type: actions.UPDATED_TRANSACTION, id, address });
      // pass to transaction creator
      return txActions.createTransaction({ args, method })(dispatch)
      .then((txHash) => {
        dispatch({ type: actions.UPDATED_TRANSACTION, id, address, payload: { txHash } });
        resolve(id);
      })
      .catch((error) => {
        dispatch({ type: actions.UPDATED_TRANSACTION, id, address, payload: { error } });
        reject(error);
      });
    });
  };
}

// TODO deploy action?
