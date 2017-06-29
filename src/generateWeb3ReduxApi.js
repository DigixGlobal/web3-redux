import { bindActionCreators } from 'redux';
import { setNetwork, removeNetwork } from './actions';

// cache it
let web3ReduxApi;

export default function generateWeb3ReduxApi(dispatch, getState) {
  if (!web3ReduxApi) {
    web3ReduxApi = {
      ...bindActionCreators({ setNetwork, removeNetwork }, dispatch),
      pendingRequests: () => getState().meta.pending || false,
    };
  }
  return web3ReduxApi;
}
