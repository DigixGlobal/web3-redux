import { fromJS } from 'immutable';

import { getArgsKey } from '../helpers';
import { actions } from '../actions/contracts';

export default function reducer(state = fromJS({}), action) {
  console.log({ action });
  switch (action.type) {
    case actions.DEPLOYING:
      return state;
    case actions.DEPLOYED:
      return state;
    case actions.GETTING:
      return state.setIn(getArgsKey(action), { fetching: true });
    case actions.GOT:
      return state.setIn(getArgsKey(action), {
        error: undefined,
        fetching: undefined,
        value: action.value,
        block: 999, // state.currentBlock
      });
    case actions.FAILED:
      return state.setIn(getArgsKey(action), { error: action.error });
    default:
      return state;
  }
}
