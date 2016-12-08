export function getArgsKey(action) {
  const args = action.args;
  const lastParam = args[args.length - 1];
  if (lastParam) {
    args[action.args.length - 1] = { from: lastParam.from };
  }
  return action.key.split('.').concat(JSON.stringify(args));
}
