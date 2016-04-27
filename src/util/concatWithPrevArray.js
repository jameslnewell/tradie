export default function(prev, next) {
  if (Array.isArray(prev)) {
    return prev.concat(next);
  }
}
