import { bindActionCreators } from 'redux';

import { web3Method } from './actions';
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
  // TODO add other statuses (fetching, created, error, etc.)
  return {
    [getterName]: (...args) => {
      const state = getState();
      if (getterName.indexOf('transaction') === 0) {
        return degrade(() => state.networks[networkId].transactions[args[0]].value);
      }
      return degrade(() => state.networks[networkId].web3Methods[getMethodKey({ groupName, methodName, args })].value);
    },
  };
}

function generateWeb3ActionCreator({ networkId, groupName, methodName, dispatch }) {
  // use the defined action creator, or fallback to regular web3 method
  const method = networkApis[networkId].web3[groupName][methodName];
  const acOverride = SUPPORTED_WEB3_METHODS[groupName][methodName].actionCreator;
  const actionCreator = acOverride || web3Method;
  return bindActionCreators({
    [methodName]: (...args) => {
      return actionCreator({ method, networkId, args, key: !acOverride && getMethodKey({ groupName, methodName, args }) });
    },
  }, dispatch);
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

  web3.eth.waitForMined = (tx, pollTime = 5 * 1000) => {
    return new Promise((resolve, reject) => {
      function poll() {
        return web3.eth.getTransactionReceipt(tx).then((res) => {
          if (res) {
            resolve(res);
          } else {
            setTimeout(poll, pollTime);
          }
        }).catch(reject);
      }
      setTimeout(poll, 10); // timeout for testrpc
    });
  };

  // deploy / get contract instances
  networkApis[networkId].contracts = {};
  web3.eth.contract = (abi) => {
    return {
      at: (address) => {
        if (!networkApis[networkId].contracts[address]) {
          networkApis[networkId].contracts[address] = generateContractApi({
            abi, address, networkId, getState, dispatch, web3: networkApis[networkId].web3,
          });
        }
        return networkApis[networkId].contracts[address];
      },
      new: (...params) => {
        // deply a new contract
        const instance = web3.eth.contract(abi);
        const args = params;
        const { data, ...rest } = args[args.length - 1];
        args[args.length] = { data };
        const newData = instance.new.getData(...args);
        args[args.length] = { ...rest, data: newData };
        return web3.eth.sendTransaction(...args)
        .then((transactionHash) => web3.eth.waitForMined(transactionHash))
        .then(({ contractAddress }) => instance.at(contractAddress));
      },
    };
  };

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
