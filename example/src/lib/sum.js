/**
 * Add some numbers
 * @param   {array} args The numbers
 * @returns {number}
 */
export default function(...args) {
  return args.reduce((total, next) => (total + next), 0);
}
;