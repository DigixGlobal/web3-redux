import { getTransaction, sendTransaction } from './actions';

export const SUPPORTED_WEB3_METHODS = {
  net: {
    getListening: {},
    getPeerCount: {},
  },
  version: {
    getNode: {},
    getNetwork: {},
    getEthereum: {},
    getWhisper: {},
  },
  eth: {
    getBalance: {},
    getCode: {},
    getTransactionCount: {},
    getStorageAt: {},
    getSyncing: {},
    getCoinbase: {},
    getMining: {},
    getHashrate: {},
    getGasPrice: {},
    getAccounts: {},
    getBlockNumber: {},
    getBlock: {},
    getBlockTransactionCount: {},
    getUncle: {},
    // getTransactionFromBlock: {},
    getTransaction: { actionCreator: getTransaction },
    // getTransactionReceipt: {},
    sendTransaction: { actionCreator: sendTransaction },
    sendRawTransaction: { actionCreator: sendTransaction },
  },
};
