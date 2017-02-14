import update from 'immutability-helper';
import { actions } from './actions';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.SET_NETWORK:
      // set the provider of the network
      return update(state, { networks: { [action.networkId]: { enabled: { $set: true } } } });
    case actions.REMOVE_NETWORK:
      // unset the provider of the network
      return update(state, { networks: { [action.networkId]: { enabled: { $set: false } } } });
    default:
      return state;
  }
}
