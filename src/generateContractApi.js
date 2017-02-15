import { bindActionCreators } from 'redux';
import { callContractMethod, createContractTransaction } from './actions';
import { degrade, getMethodKey } from './helpers';

function generateContractInstanceApi({ abi, address, networkId, getState, dispatch, web3 }) {
  // cached version doesn't exist, create it
  const contractInstance = web3.eth.contract(abi).at(address);
  // // reduce the abi into the redux methods
  const api = abi.reduce((o, definition) => {
    // skip if we're not dealing with a function
    if (definition.type !== 'function') { return o; }
    const methodName = definition.name;
    // // buid the actions
    const actions = bindActionCreators({
      call: (...args) => callContractMethod({
        networkId, args, address, key: getMethodKey({ methodName, args }), method: contractInstance[methodName].call,
      }),
      sendTransaction: (...args) => createContractTransaction({
        networkId, args, address, key: getMethodKey({ methodName, args }), method: contractInstance[methodName].sendTransaction,
      }),
    }, dispatch);
    // base getter
    const contractMethod = (...args) => {
      return degrade(() => getState().networks[networkId].contracts[address].calls[getMethodKey({ methodName, args })].value);
    };
    // add actions to base getter
    contractMethod.call = actions.call;
    contractMethod.sendTransaction = actions.sendTransaction;
    // // reduce with added actions
    return { ...o, [methodName]: contractMethod };
  }, {});
  // decorate
  api.address = address;
  return api;
}

export default function generateContractAPI({ web3, networkApi, networkId, getState, dispatch }) {
  const cache = {};
  return (abi) => {
    const api = {
      at(address) {
        if (!cache[address]) {
          cache[address] = generateContractInstanceApi({
            abi, address, networkId, getState, dispatch, web3: networkApi.web3,
          });
        }
        return cache[address];
      },
      new(...params) {
        // deply a new contract
        const instance = networkApi.web3.eth.contract(abi);
        const args = params;
        const { data, ...rest } = args[args.length - 1];
        args[args.length] = { data };
        const newData = instance.new.getData(...args);
        args[args.length] = { ...rest, data: newData };
        return web3.eth.sendTransaction(...args)
        .then((transactionHash) => web3.eth.waitForMined(transactionHash))
        .then(({ contractAddress }) => api.at(contractAddress));
      },
    };
    return api;
  };
}
