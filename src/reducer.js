import update from 'immutability-helper';
import { actions } from './actions';

const DEFAULT_STATE = {
  networks: {},
  meta: {},
};

// function updateNetwork(state = {}, action) {
//   switch (action.type) {
//
//   }
//   default:
//     return state;
// }

// update.extend('$unset', (keysToRemove, original) => {
//   const copy = Object.assign({}, original);
//   for (const key of keysToRemove) delete copy[key];
//   return copy;
// });

function updateNetwork(state, action, query) {
  const network = state.networks[action.networkId] || {};
  return { ...state, networks: { ...state.networks, [action.networkId]: update(network, query) } };
}

function updateTransaction(state, action, query) {
  const transaction = (state.networks[action.networkId].transactions || {})[action.key] || {};
  return updateNetwork(state, action, {
    transactions: {
      $set: {
        ...state.networks[action.networkId].transactions,
        [action.key]: update(transaction, query),
      },
    },
  });
}

export default function (state = DEFAULT_STATE, action) {
  // console.log(action);
  switch (action.type) {
    case actions.NETWORK_REMOVED: {
      const networks = { ...state.networks };
      delete networks[action.networkId];
      return { ...state, networks };
    }
    case actions.NETWORK_SET_WEB3: {
      return updateNetwork(state, action, { meta: { $set: { enabled: action.payload.enabled } } });
    }
    case actions.WEB3_METHOD_SUCCESS: {
      return updateNetwork(state, action, { web3Methods: { $set: { [action.key]: action.payload } } });
    }
    case actions.TRANSACTION_UPDATED: {
      return updateTransaction(state, action, { $merge: action.payload });
    }
    default:
      return state;
  }
}
