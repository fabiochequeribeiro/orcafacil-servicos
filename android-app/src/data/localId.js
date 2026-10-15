export function localId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
