export function getArgsKey(action) {
  if (!action.key || !action.args) { return null; }
  const args = [...action.args];
  const lastParam = args[args.length - 1];
  if (lastParam) {
    args[action.args.length - 1] = { from: lastParam.from };
  }
  return action.key.split('.').concat(JSON.stringify(args));
}

// export function removeGetPrefix(key) {
//   // remove get prefix
//   if (key.indexOf('get') === 0) {
//     const str = key.replace('get', '');
//     return `${str.substr(0, 1).toUpperCase()}${str.substr(1)}`;
//   }
//   return key;
// }
