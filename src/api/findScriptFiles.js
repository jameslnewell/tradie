import findFiles from './findFiles';
import isScriptFile from './isScriptFile';

/**
 * Recursively list script files named `*.js` in the `./src` directory
 * @params  {object}  config  The tradie config
 * @returns {Promise<Array<string>>}
 */
export default function(config) {
  return findFiles(config)
    .then(files => files.filter(file => isScriptFile(file, config)))
  ;
}
