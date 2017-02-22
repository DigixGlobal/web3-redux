import update from 'immutability-helper';
import { actions } from './actions';

const DEFAULT_STATE = {
  networks: {},
  meta: {
    pending: 0,
  },
};

function updateNetwork(state, action, query) {
  const network = state.networks[action.networkId] || { meta: {}, transactions: {}, contracts: {} };
  return { ...state, networks: { ...state.networks, [action.networkId]: update(network, query) } };
}

function updateTransaction(state, action, query) {
  const transactions = state.networks[action.networkId].transactions || {};
  const transaction = transactions[action.key] || {};
  return updateNetwork(state, action, { transactions: { $set: { ...transactions, [action.key]: update(transaction, query) } } });
}

function updateContract(state, action, query) {
  const contracts = state.networks[action.networkId].contracts || {};
  const contract = contracts[action.address] || { transactions: [] };
  return updateNetwork(state, action, { contracts: { $set: { ...contracts, [action.address]: update(contract, query) } } });
}

export default function (state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actions.XHR: {
      // total pending xhr requests; update network and total
      const pendingUpdate = { meta: { pending: { $apply: (n = 0) => n + action.count } } };
      const updatedState = updateNetwork(state, action, pendingUpdate);
      return update(updatedState, pendingUpdate);
    }
    case actions.NETWORK_REMOVED: {
      const networks = { ...state.networks };
      delete networks[action.networkId];
      return { ...state, networks };
    }
    case actions.NETWORK_SET_WEB3: {
      return updateNetwork(state, action, { meta: { $merge: action.payload } });
    }
    case actions.WEB3_METHOD_SUCCESS: {
      return updateNetwork(state, action, { web3Methods: { $set: { [action.key]: action.payload } } });
    }
    case actions.TRANSACTION_UPDATED: {
      return updateTransaction(state, action, { $merge: action.payload });
    }
    case actions.CONTRACT_METHOD_SUCCESS: {
      return updateContract(state, action, { calls: { $set: { [action.key]: action.payload } } });
    }
    case actions.CONTRACT_TRANSACTION_CREATED: {
      return updateContract(state, action, { transactions: { $push: [action.payload.value] } });
    }
    default:
      return state;
  }
}
