import { fromJS } from 'immutable';

import { getArgsKey } from '../helpers';
import { actions } from '../actions/contracts';

import fetch from './fetch';

export default function reducer(state = fromJS({}), action) {
  switch (action.type) {
    case actions.UPDATED_TRANSACTION:
      return state.setIn([action.address, 'transactions', action.id], action.payload);
    default:
      return fetch(state, actions, action, getArgsKey(action));
  }
}
