export default function (state, actions, action, key, merge) {
  switch (action.type) {
    case actions.GETTING:
      return state.updateIn(key, v => ({ ...v, fetching: true }));
    case actions.GOT:
      return state.updateIn(key, v => ({
        ...v,
        fetching: false,
        error: false,
        value: merge ? { ...v.value, ...action.value } : action.value,
        blockFetched: 999, // TODO get current block
      }));
    case actions.FAILED:
      return state.updateIn(key, v => ({ ...v, error: action.error, fetching: false }));
    default:
      return state;
  }
}
