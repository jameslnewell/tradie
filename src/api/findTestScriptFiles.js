import findFiles from './findFiles';
import isTestScriptFile from './isTestScriptFile';

/**
 * Recursively list script files named `*.test.js` in the `./src` directory
 * @params  {object}  config  The tradie config
 * @returns {Promise<Array<string>>}
 */
export default function(config) {
  return findFiles(config)
    .then(files => files.filter(file => isTestScriptFile(file, config)))
    ;
}
