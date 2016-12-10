import { fromJS } from 'immutable';
import { actions } from '../actions/transactions';

import fetch from './fetch';

export default function reducer(state = fromJS({}), action) {
  console.log({ action })
  switch (action.type) {
    case actions.CREATED:
      return state.setIn([action.txHash], { created: action.created });
    default:
      return fetch(state, actions, action, action.args && [action.args[0]], true);
  }
}
