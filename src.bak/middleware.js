import { actions } from './actions';

const matchedActions = [actions.WEB3_GET, actions.WEB3_GOT, actions.WE3_GET_FAILED];

export default function ({ dispatch }) {
  let pending = 0;
  return next => action => {
    const { type } = action;
    if (matchedActions.indexOf(type) > -1) {
      const previous = pending;
      if (type === matchedActions[0]) {
        pending++;
      } else {
        pending--;
      }
      if (previous === 0 && pending === 1) {
        dispatch({ type: actions.STATUS, status: { pending: true } });
      }
      if (previous === 1 && pending === 0) {
        dispatch({ type: actions.STATUS, status: { pending: false } });
      }
      if (type === matchedActions[0] || type === matchedActions[2]) {
        // cancel this action for perf
        return null;
      }
    }
    return next(action);
  };
}
