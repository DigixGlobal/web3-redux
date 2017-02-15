export function degrade(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    return fallback;
  }
}

export function getMethodKey({ groupName, methodName, args }) {
  return `${groupName}.${methodName}(${JSON.stringify(args)})`;
}
