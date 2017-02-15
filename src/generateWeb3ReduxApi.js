import { setNetwork, removeNetwork } from './actions';
import { bindActionCreators } from 'redux';

// cache it
let web3ReduxApi;

export default function generateWeb3ReduxApi(dispatch) {
  if (!web3ReduxApi) {
    web3ReduxApi = bindActionCreators({ setNetwork, removeNetwork }, dispatch);
  }
  return web3ReduxApi;
}
