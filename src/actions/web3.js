import { NAMESPACE, WEB3_API } from '../constants';

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

/*
function removeGetPrefix(key) {
  // remove get prefix
  if (key.indexOf('get') === 0) {
    const str = key.replace('get', '');
    return `${str.substr(0, 1).toUpperCase()}${str.substr(1)}`;
  }
  return key;
}
*/

// not an action
export function web3ReduxMethods({ web3 }) {
  const api = {};
  Object.keys(WEB3_API).forEach((key) => {
    const keys = key.split('.');
    const groupKey = keys[0];
    const methodKey = keys[1];
    if (!api[groupKey]) { api[groupKey] = {}; }
    api[groupKey][methodKey] = (...args) => {
      const method = web3[groupKey][methodKey];
      return getWeb3Method({ key, method, args, actionNames: actions });
    };
  });
  return api;
}
