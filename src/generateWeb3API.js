import { bindActionCreators } from 'redux';
import { getWeb3Method, createTransaction, getTransaction } from './actions';
import generateContractAPI from './generateContractAPI';

const web3API = {
  'net.getListening': {},
  'net.getPeerCount': {},
  'version.getNode': {},
  'version.getNetwork': {},
  'version.getEthereum': {},
  'version.getWhisper': {},
  'eth.getBalance': {},
  'eth.getCode': {},
  'eth.getTransactionCount': {},
  'eth.getStorageAt': {},
  'eth.getSyncing': {},
  'eth.getCoinbase': {},
  'eth.getMining': {},
  'eth.getHashrate': {},
  'eth.getGasPrice': {},
  'eth.getAccounts': {},
  'eth.getBlockNumber': {},
  'eth.getBlock': {},
  'eth.getBlockTransactionCount': {},
  'eth.getUncle': {},
  'eth.getTransactionFromBlock': {},
  'eth.getTransaction': {
    collection: 'transactions',
    actionCreator: getTransaction,
  },
  'eth.getTransactionReceipt': {
    collection: 'transactions',
    actionCreator: getTransaction,
  },
  'eth.sendTransaction': {
    collection: 'transactions',
    actionCreator: createTransaction,
  },
  'eth.sendRawTransaction': {
    collection: 'transactions',
    actionCreator: createTransaction,
  },
};

export default function ({ network, getStore, getDispatch, web3 }) {
  const networkId = network.key;
  if (!web3) { return null; }
  // TODO better refactoring
  const api = {};
  // for accessing raw web3
  api.rawWeb3 = web3;
  // reduce the web3 api and decorate with methods
  api.web3 = Object.keys(web3API).reduce((o, key) => {
    // get specific actions for this method
    const collection = web3API[key].collection || 'web3';
    const actionCreator = web3API[key].actionCreator || getWeb3Method;
    // eth.getNode => [eth, getNode]
    const [groupKey, methodKey] = key.split('.');
    // the web3 method itself
    const method = web3[groupKey][methodKey];
    // default getter
    const { action } = bindActionCreators({ action: (...args) => actionCreator({ collection, key, method, args, networkId }) }, getDispatch());
    // all instances have an action creator
    const reduxMethod = { [methodKey]: action };
    // add the getter if it starts with `get`
    if (methodKey.indexOf('get') === 0) {
      const getterMethod = methodKey.split('get')[1];
      const getterKey = `${getterMethod[0].toLowerCase()}${getterMethod.slice(1)}`;
      reduxMethod[getterKey] = (...args) => {
        const gotStore = getStore().web3Redux;
        if (!gotStore) { return null; }
        const index = getterKey === 'transaction' ?
        ['networks', networkId, 'transactions', args[0]] :
        ['networks', networkId, 'web3', groupKey, methodKey, JSON.stringify(args)];
        return (gotStore.getIn(index) || {}).value;
      };
    }
    // reduce
    return { ...o, [groupKey]: { ...o[groupKey], ...reduxMethod } };
  }, {});
  // pass a tx, wait for it to be mined
  api.web3.eth.waitForMined = (tx, pollTime = 10 * 1000) => {
    return new Promise((resolve, reject) => {
      function poll() {
        return api.web3.eth.getTransactionReceipt(tx).then((res) => {
          if (res) {
            resolve(res);
          } else {
            setTimeout(poll, network.pollTime || pollTime);
          }
        }).catch(reject);
      }
      setTimeout(poll, 10); // timeout for testrpc
    });
  };
  // deploy / get contract instances
  const contractCache = {};
  api.web3.eth.contract = (abi) => {
    return {
      at: (address) => {
        if (contractCache[address]) { return contractCache[address]; }
        contractCache[address] = generateContractAPI({ abi, address, networkId, getStore, getDispatch, web3 });
        return contractCache[address];
      },
      new: (...params) => {
        // deply a new contract
        const instance = web3.eth.contract(abi);
        const args = params;
        const { data, ...rest } = args[args.length - 1];
        args[args.length] = { data };
        const newData = instance.new.getData.apply(instance, args);
        args[args.length] = { ...rest, data: newData };
        return api.web3.eth.sendTransaction.apply(null, args)
        .then((transactionHash) => api.web3.eth.waitForMined(transactionHash))
        .then(({ contractAddress }) => instance.at(contractAddress));
      },
    };
  };
  return api;
}
