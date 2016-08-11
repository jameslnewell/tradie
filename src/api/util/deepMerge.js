const mergeWith = require('lodash.mergewith');

/**
 * Combine settings from two configuration objects and merge any duplicate settings
 * @param   {object} objA
 * @param   {object} objB
 * @returns {object} Returns a new config object
 */
module.exports = (objA, objB) => mergeWith({}, objA, objB, (prev, next) => {
  if (Array.isArray(prev)) {
    return prev.concat(next);
  } else {
    return;
  }
});
