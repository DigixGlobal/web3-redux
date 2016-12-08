import { fromJS } from 'immutable';

import { getArgsKey } from '../helpers';
import { actions } from '../actions/web3';

export default function reducer(state = fromJS({}), action) {
  switch (action.type) {
    case actions.GETTING:
      return state.setIn(getArgsKey(action), { fetching: true });
    case actions.GOT:
      return state.setIn(getArgsKey(action), {
        error: undefined,
        fetching: undefined,
        value: action.value,
        block: 999,
      });
    case actions.FAILED:
      return state.setIn(getArgsKey(action), { error: action.error });
    default:
      return state;
  }
}
