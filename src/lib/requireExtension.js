import resolve from 'resolve';
import TradieError from './TradieError';

/**
 * Require an extension
 * @param   {string}    name                The extension name
 * @param   {string}    type                The extension type
 * @param   {options}   [options]
 * @param   {function}  [options.basedir]
 * @param   {function}  [options.resolve]
 * @param   {function}  [options.require]
 * @returns {Promise<Function>}
 */
export default function(name, type, options) {

  const basedir = options && options.basedir || process.cwd();
  const resolveModule = options && options.resolve || resolve;
  const requireModule = options && options.require || require;

  //get the full name of the extension
  if (!name.startsWith(`@`) && !name.startsWith(`tradie-${type}-`)) {
    name = `tradie-${type}-${name}`;
  }

  return new Promise((resolvePromise, rejectPromise) => {

    //resolve the plugin
    resolveModule(name, {basedir}, (resolveError, file) => {

      if (resolveError) {
        return rejectPromise(new TradieError(`Cannot resolve ${type} "${name}".`, resolveError));
      }

      //require the plugin
      let extension = null;
      try {
        extension = requireModule(file); //eslint-disable-line
      } catch (requireError) {
        return rejectPromise(new TradieError(`Cannot require ${type} "${name}".`, requireError));
      }

      //accept modules written in both ES5 and ES6
      if (typeof extension !== 'function') {
        if (typeof extension.default === 'function') {
          extension = extension.default;
        } else {
          return rejectPromise(new TradieError(`Invalid ${type} "${name}".`));
        }
      }

      resolvePromise(extension);
    });
  });

}