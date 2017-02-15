const NAMESPACE = 'web3-redux';

export const actions = {
  NETWORK_SET_WEB3: `${NAMESPACE} network set web3`,
  NETWORK_REMOVED: `${NAMESPACE} network removed`,
  // AJAX_UPDATED: `${NAMESPACE} web3 method ajax updated`,
  // TRANSACTION_UPDATED: `${NAMESPACE} updated transaction`,
};

export const web3Instances = {};

function removeWeb3(networkId) {
  if (web3Instances[networkId]) {
    web3Instances[networkId].reset();
    delete web3Instances[networkId];
  }
}

export function setNetwork({ networkId, web3 }) {
  return (dispatch) => {
    removeWeb3(networkId);
    web3Instances[networkId] = web3;
    dispatch({ type: actions.NETWORK_SET_WEB3, networkId, payload: { enabled: !!web3 } });
    // console.log({ web3Instances });
  };
}

export function removeNetwork({ networkId }) {
  return (dispatch) => {
    removeWeb3(networkId);
    dispatch({ type: actions.NETWORK_REMOVED, networkId });
  };
}
