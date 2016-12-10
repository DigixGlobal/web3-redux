import { NAMESPACE } from '../constants';

export const actions = {
  CREATED: `${NAMESPACE} created transaction`,
  GETTING: `${NAMESPACE} getting transaction info`,
  GOT: `${NAMESPACE} got transaction info`,
  FAILED: `${NAMESPACE} failed to get transaction info`,
};

// trigger update to parent contract; push transaction ID
// works with contracts + sendValue
export function createTransaction({ args, method }) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      method.apply(null, args.concat([(err, txHash) => {
        if (err) { return reject(err); }
        dispatch({ type: actions.CREATED, txHash, created: new Date() });
        // TODO start poll to get the tx details?
        return resolve(txHash);
      }]));
    });
  };
}
