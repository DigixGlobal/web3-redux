import { getTransaction, createTransaction } from './actions';

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
    getTransactionReceipt: { actionCreator: getTransaction },
    sendTransaction: { actionCreator: createTransaction },
    sendRawTransaction: { actionCreator: createTransaction },
  },
};
