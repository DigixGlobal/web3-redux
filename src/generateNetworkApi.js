// import { setNetwork, removeNetwork } from './actions';
// import { bindActionCreators } from 'redux';
//
// export default function generateWeb3ReduxApi(dispatch) {
//   return bindActionCreators({ setNetwork, removeNetwork }, dispatch);
// }

// export cache to actions so it's invalided when web3 is set
export const networkApis = {};

function generateNetworkApi({ networkId, state, dispatch }) {
  console.log(networkApis[networkId]);
  // check if we have web3...
  return {};
}

export default function getNetworkApi({ networkId, state, dispatch }) {
  // shares the same cache networkId as the web3 instance
  if (!networkApis[networkId] || !networkApis[networkId].api) {
    networkApis[networkId] = {
      ...networkApis[networkId], api: generateNetworkApi({ networkId, state, dispatch }),
    };
  }
  return networkApis[networkId].api;
}
