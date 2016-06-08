import mergewith from 'lodash.mergewith';

/**
 * Combine settings from two configuration objects and merge any duplicate settings
 * @param   {object} cfg1
 * @param   {object} cfg2
 * @returns {object} Returns a new config object
 */
export default function(cfg1, cfg2) {
  return mergewith({}, cfg1, cfg2, (prev, next) => {
    if (Array.isArray(prev)) {
      return prev.concat(next);
    } else {
      return;
    }
  });
}
