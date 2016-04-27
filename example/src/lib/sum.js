/**
 * Add some numbers
 * @param   {array} args The numbers
 * @returns {number}
 */
export default function(...args) {
  throw new Error('foo!');
  return args.reduce((total, next) => (total + next), 0);
}
