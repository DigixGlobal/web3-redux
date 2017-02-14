import update from 'immutability-helper';
import { actions } from './actions';

function argsKey(action) {
  if (!action.args || !action.key) { return []; }
  const args = [...action.args];
  const lastParam = args[args.length - 1];
  if (lastParam && lastParam.from) {
    args[args.length - 1] = { from: lastParam.from };
  }
  return action.key.split('.').concat(JSON.stringify(args));
}

function collectionKey(action, append = []) {
  switch (action.collection) {
    case 'web3':
      return ['networks', action.networkId, 'web3'].concat(argsKey(action)).concat(append);
    case 'contracts':
      return ['networks', action.networkId, 'contracts', action.address].concat(argsKey(action)).concat(append);
    case 'transactions':
      return ['networks', action.networkId, 'transactions', action.txHash].concat(append);
    default:
      return [].concat(append);
  }
}

// TODO refactor

function setCollection(state, action, append, update) {
  // replace with immtability helper
  return state.setIn(collectionKey(action, update && append), update || append);
}

function updateCollection(state, action, append, update) {
  return state.updateIn(collectionKey(action, update && append), update || append);
}

// ensure value is serializable (not bigNumber)
function serializedValue(value) {
  return value && value.toString ? value.toString() : value;
}

export default function (state = {}, action) {
  console.log(action.type, action);
  switch (action.type) {
    case actions.CONTRACT_UPDATED_TRANSACTION:
      return setCollection(state, action, ['transactions', action.id], action.payload);
    case actions.TRANSACTION_CREATED:
      return setCollection(state, action, { created: action.created });
    case actions.STATUS:
      return update(state, { status: { $merge: action.status } });
    case actions.NETWORK_STATUS:
      return update(state, { networks: { [action.networkId]: { status: { $set: action.status } } } });
    case actions.WEB3_GOT:
      return updateCollection(state, action, o => ({
        ...o,
        fetching: false,
        error: false,
        value: serializedValue(action.value),
      }));
    default:
      return state;
  }
}
