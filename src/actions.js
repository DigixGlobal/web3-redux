const NAMESPACE = 'web3-redux';

export const actions = {
  NETWORK_SET: `${NAMESPACE} network set`,
  NETWORK_REMOVED: `${NAMESPACE} network removed`,
  // AJAX_UPDATED: `${NAMESPACE} web3 method ajax updated`,
  // TRANSACTION_UPDATED: `${NAMESPACE} updated transaction`,
};

const web3Instances = {};

// not a real action...
export function setNetwork({ networkId, web3 }) {
  return (dispatch) => {
    web3Instances[networkId] = web3;
    dispatch({ type: actions.NETWORK_SET, networkId });
  };
}

export function removeNetwork({ networkId }) {
  return (dispatch) => {
    web3Instances[networkId].reset();
    delete web3Instances[networkId];
    dispatch({ type: actions.NETWORK_REMOVED, networkId });
  };
}
