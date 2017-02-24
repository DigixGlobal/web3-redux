import { web3Method, updateNetwork, actions } from './actions';
import { SUPPORTED_WEB3_METHODS } from './constants';
import { degrade, getMethodKey } from './helpers';
import generateContractApi from './generateContractApi';
// export cache to actions so it's invalided when web3 is reset
export const networkApis = {};

// returns the value value of the gotten web3 method
function generateWeb3Getter({ getState, networkId, methodName, groupName }) {
  if (methodName.indexOf('get') !== 0) { return null; }
  const getterFragment = methodName.split('get')[1];
  const getterName = `${getterFragment[0].toLowerCase()}${getterFragment.slice(1)}`;
  const meta = (...args) => {
    const state = getState();
    if (getterName.indexOf('transaction') === 0) {
      return degrade(() => state.networks[networkId].transactions[args[0]]);
    }
    return degrade(() => state.networks[networkId].web3Methods[getMethodKey({ groupName, methodName, args })]);
  };
  const getter = { [getterName]: (...args) => (meta(...args) || {}).value };
  getter.meta = meta;
  return getter;
}

function generateWeb3ActionCreator({ networkId, groupName, methodName, dispatch }) {
  // use the defined action creator, or fallback to regular web3 method
  if (!networkApis[networkId].web3) {
    // return stubbed version if web3 not defined...
    return {
      [methodName]: () => {
        return new Error('Web3 is not enabled');
      },
    };
  }
  const method = networkApis[networkId].web3[groupName][methodName];
  const acOverride = SUPPORTED_WEB3_METHODS[groupName][methodName].actionCreator;
  const actionCreator = acOverride || web3Method;
  return {
    [methodName]: (...args) => {
      return dispatch(actionCreator({ method, networkId, args, key: !acOverride && getMethodKey({ groupName, methodName, args }) }));
    },
  };
}

function generateWeb3Methods(params) {
  return {
    ...generateWeb3Getter(params),
    ...generateWeb3ActionCreator(params),
  };
}

function generateNetworkApi({ networkId, getState, dispatch }) {
  // WEB3 API WRAPPER
  // reduce the supported api into action creators and getters
  const web3 = Object.keys(SUPPORTED_WEB3_METHODS).reduce((o, groupName) => ({
    ...o, [groupName]: Object.keys(SUPPORTED_WEB3_METHODS[groupName]).reduce((o2, methodName) => ({
      ...o2, ...generateWeb3Methods({ methodName, networkId, getState, dispatch, groupName }),
    }), {}),
  }), {});
  // CUSTOM CONTRACT WRAPPER
  web3.eth.contract = generateContractApi({ web3, networkId, getState, dispatch, networkApi: networkApis[networkId] });
  // EXTEDNED API
  // nice little helper function
  web3.eth.waitForMined = (tx, pollTime = 5 * 1000) => {
    return new Promise((resolve) => {
      function poll() {
        return web3.eth.getTransactionReceipt(tx).then((res) => {
          if (res && res.blockNumber) {
            resolve(res);
          } else {
            setTimeout(poll, pollTime);
          }
        }).catch(() => {
          setTimeout(poll, pollTime);
        });
      }
      setTimeout(poll, 10); // timeout for testrpc
    });
  };
  web3.connectionStatus = () => {
    const { enabled, connecting, connected } = getState().networks[networkId].meta;
    if (!enabled) {
      return 'disabled';
    }
    if (connecting) {
      return 'connecting';
    }
    if (connected) {
      return 'connected';
    }
    // failed to connect
    return 'disconnected';
  };
  web3.pendingRequests = () => (getState().networks[networkId].meta || {}).pending || false;
  // INITIALIZATION / STATUS
  // get the first block to update connection status
  if (networkApis[networkId].web3) {
    const engine = networkApis[networkId].web3.currentProvider;
    engine.on('error', (err) => console.error('got err', err));
    engine._fetchLatestBlock((err, res) => {
      if (err) { return setTimeout(() => dispatch(updateNetwork({ networkId, payload: { connecting: false, connected: false } })), 1); }
      // if (err) { return dispatch(updateNetwork({ networkId, payload: { connecting: false, connected: false } })); }
      // // update the network state
      dispatch(updateNetwork({ networkId, payload: { connecting: false, connected: true } }));
      // update the block number (without making another request)s;
      const value = parseInt(res.number.toString('hex'), 16);
      const key = getMethodKey({ groupName: 'eth', methodName: 'getBlockNumber', args: [] });
      return dispatch({ type: actions.WEB3_METHOD_SUCCESS, networkId, key, payload: { value, updated: new Date() } });
    });
  }
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
