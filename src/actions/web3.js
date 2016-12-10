import { NAMESPACE } from '../constants';

export const actions = {
  GETTING: `${NAMESPACE} getting web3 method`,
  GOT: `${NAMESPACE} got web3 method`,
  FAILED: `${NAMESPACE} failed to get web3 method`,
};

export function getWeb3Method({ method, key, actionNames, args = [] }) {
  // dispatch a thunk
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: actionNames.GETTING, key, args });
      method.apply(null, args.concat([(err, res) => {
        if (err) {
          dispatch({ type: actionNames.FAILED, key, args, error: err });
          return reject(err);
        }
        dispatch({ type: actionNames.GOT, key, args, value: res });
        return resolve(res);
      }]));
    });
  };
}
