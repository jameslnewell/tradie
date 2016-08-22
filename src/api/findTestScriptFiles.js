import findFiles from './findFiles';
import isTestScriptFile from './isTestScriptFile';

/**
 * Recursively list script files named `*.test.js` in the `./src` directory
 * @params  {object}  options  The tradie config
 * @returns {Promise<Array<string>>}
 */
export default function(options) {

  //find all source files
  return findFiles(options)

    //exclude source files which are not test script files
    .then(files => files.filter(file => isTestScriptFile(file, options)))

  ;
}
