import { actions } from './actions';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.CUSTOM_ACTION:
      return { ...state, myThing: Math.random() };
    default:
      return state;
  }
}
