import { bindActionCreators } from 'redux';

import { web3Method } from './actions';
import { SUPPORTED_WEB3_METHODS } from './constants';
import { degrade, getMethodKey } from './helpers';

// export cache to actions so it's invalided when web3 is reset
export const networkApis = {};

// returns the value value of the gotten web3 method
function generateWeb3Getter({ getState, networkId, methodName, groupName }) {
  if (methodName.indexOf('get') !== 0) { return null; }
  const getterFragment = methodName.split('get')[1];
  const getterName = `${getterFragment[0].toLowerCase()}${getterFragment.slice(1)}`;
  // TODO add other statuses (fetching, created, error, etc.)
  return {
    [getterName]: (...args) => {
      const state = getState();
      if (getterName === 'transaction') {
        return degrade(() => state.networks[networkId].transactions[args[0]].value);
      }
      return degrade(() => state.networks[networkId].web3Methods[getMethodKey({ groupName, methodName, args })].value);
    },
  };
}

function generateWeb3ActionCreator(params) {
  const { groupName, methodName, dispatch } = params;
  // use the defined action creator, or fallback to regular web3 method
  const method = SUPPORTED_WEB3_METHODS[groupName][methodName].actionCreator || web3Method;
  return bindActionCreators({ [methodName]: (...args) => method({ args, ...params }) }, dispatch);
}

function generateWeb3Methods(params) {
  return {
    ...generateWeb3Getter(params),
    ...generateWeb3ActionCreator(params),
  };
}

function generateNetworkApi({ networkId, getState, dispatch }) {
  // reduce the supported api into action creators and getters
  const web3 = Object.keys(SUPPORTED_WEB3_METHODS).reduce((o, groupName) => ({
    ...o, [groupName]: Object.keys(SUPPORTED_WEB3_METHODS[groupName]).reduce((o2, methodName) => ({
      ...o2, ...generateWeb3Methods({ methodName, networkId, getState, dispatch, groupName }),
    }), {}),
  }), {});
  // api.eth.contract ...
  // api.eth.waitForMined ...
  return { web3 };
}

export default function getNetworkApi({ networkId, getState, dispatch }) {
  // shares the same cache networkId as the web3 instance
  if (!networkApis[networkId] || !networkApis[networkId].api) {
    networkApis[networkId] = {
      ...networkApis[networkId],
      api: generateNetworkApi({ networkId, dispatch, getState }),
    };
  }
  return networkApis[networkId].api;
}
