export default function degrade(fn) {
  try { return fn(); } catch (e) { return {}; }
}
