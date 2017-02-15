import { networkApis } from './generateNetworkApi';

const NAMESPACE = 'web3-redux';

export const actions = {
  NETWORK_SET_WEB3: `${NAMESPACE} network set web3`,
  NETWORK_REMOVED: `${NAMESPACE} network removed`,
  // AJAX_UPDATED: `${NAMESPACE} web3 method ajax updated`,
  // TRANSACTION_UPDATED: `${NAMESPACE} updated transaction`,
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
  return (dispatch) => {
    removeWeb3(networkId);
    networkApis[networkId] = { web3 };
    dispatch({ type: actions.NETWORK_SET_WEB3, networkId, payload: { enabled: !!web3 } });
  };
}

export function removeNetwork({ networkId }) {
  return (dispatch) => {
    removeWeb3(networkId);
    dispatch({ type: actions.NETWORK_REMOVED, networkId });
  };
}
