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

update.extend('$unset', (keysToRemove, original) => {
  const copy = Object.assign({}, original);
  for (const key of keysToRemove) delete copy[key];
  return copy;
});

function updateNetwork(state, action, query) {
  const network = state.networks[action.networkId] || {};
  return { ...state, networks: { ...state.networks, [action.networkId]: update(network, query) } };
}

export default function (state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actions.NETWORK_SET_WEB3: {
      // set or unset the provider of the network
      // const { networkId, payload } = action;
      // update(state, { a: {} })
      // return update(state, { some: { other: { nested: { $set: 1 }}}})
      // return update(state, { networks: { [networkId]: { meta: { $set: payload } } } });
      return updateNetwork(state, action, { meta: { $set: { enabled: action.payload.enabled } } });
    }
    case actions.NETWORK_REMOVED: {
      // remove the network
      const networks = { ...state.networks };
      delete networks[action.networkId];
      return { ...state, networks };
    }
    default:
      return state;
  }
}
