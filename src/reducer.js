import { fromJS } from 'immutable';
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
      return [action.networkId, 'web3'].concat(argsKey(action)).concat(append);
    case 'contracts':
      return [action.networkId, 'contracts', action.address].concat(argsKey(action)).concat(append);
    case 'transactions':
      return [action.networkId, 'transactions', action.txHash].concat(append);
    default:
      return [].concat(append);
  }
}

function setCollection(state, action, append, update) {
  return state.setIn(collectionKey(action, update && append), update || append);
}

function updateCollection(state, action, append, update) {
  return state.updateIn(collectionKey(action, update && append), update || append);
}

export default function (state = fromJS({}), action) {
  switch (action.type) {
    case actions.CONTRACT_UPDATED_TRANSACTION:
      return setCollection(state, action, ['transactions', action.id], action.payload);
    case actions.TRANSACTION_CREATED:
      return setCollection(state, action, { created: action.created });
    case actions.WEB3_GET:
      return updateCollection(state, action, o => ({
        ...o,
        fetching: true,
      }));
    case actions.WEB3_GET_FAILED:
      return updateCollection(state, action, o => ({
        ...o,
        error: action.error,
        fetching: false,
      }));
    case actions.WEB3_GOT:
      return updateCollection(state, action, o => ({
        ...o,
        fetching: false,
        error: false,
        value: action.value,
        blockFetched: 999, // todo determine properly
      }));
    default:
      return state;
  }
}
