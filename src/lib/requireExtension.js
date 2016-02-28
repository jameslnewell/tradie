import resolve from 'resolve';
import TradieError from './TradieError';

/**
 * Require an extension
 * @param   {string}    name                The extension name
 * @param   {options}   options
 * @param   {string}    options.type        The extension type
 * @param   {function}  [options.resolve]
 * @param   {function}  [options.require]
 * @returns {Promise<Function>}
 */
export default function(name, options) {
  const {type} = options;

  const resolveModule = options.resolve || resolve;
  const requireModule = options.require || require;

  //get the full name of the extension
  if (!name.startsWith(`tradie-${type}-`)) {
    name = `tradie-${type}-${name}`;
  }

  return new Promise((resolvePromise, rejectPromise) => {

    //resolve the plugin
    resolveModule(name, {basedir: process.cwd()}, (resolveError, file) => {

      if (resolveError) {
        return rejectPromise(new TradieError(`Cannot resolve ${type} "${name}".`, resolveError));
      }

      //require the plugin
      let fn = null;
      try {
        fn = requireModule(file); //eslint-disable-line
        fn = fn.default || fn;    //require modules written in both ES5 and ES6
      } catch (requireError) {
        return rejectPromise(new TradieError(`Cannot require ${type} "${name}".`, requireError));
      }

      resolvePromise(fn);
    });
  });

}