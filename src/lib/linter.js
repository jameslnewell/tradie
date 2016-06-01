import path from 'path';
import {CLIEngine} from 'eslint';

/**
 * Filter out any file which is not in the ./src directory and doesn't have a script extension
 * @param   {string|array}  fileOrFiles
 * @param   {string}        src
 * @param   {array}         extensions
 * @returns {array}
 */
function filterScriptFiles(fileOrFiles, src, extensions) {
  return [].concat(fileOrFiles)

    //exclude files not in the ./src directory
    .filter(file => path.normalize(file).indexOf(src) === 0)

    //exclude files which have an extension but aren't on the extension list
    .filter(file => {
      const ext = path.extname(file);
      return ext === '' || extensions.indexOf(ext) !== -1;
    })

  ;
}

/**
 * Lint script files and log any warnings or errors
 * @param   {string|array}  fileOrFiles
 * @param   {array}         extensions
 * @returns {{results, errorCount, warningCount}}
 */
function lintScriptFiles(fileOrFiles, extensions) {

  const cli = new CLIEngine({extensions});
  const report = cli.executeOnFiles(fileOrFiles);

  if (report.errorCount + report.warningCount > 0) {
    const formatter = cli.getFormatter('stylish');
    console.log(formatter(report.results));
  }

  return report;
}

/**
 * Create a linter
 * @param   {object}  tradie
 * @returns {function}
 */
export default function(tradie) {
  const {config: {src, scripts: {extensions}}} = tradie;
  return scriptFiles => new Promise((resolve, reject) => {

    tradie.emit('scripts.linting.started');
    const startTime = Date.now();

    const filteredScriptFiles = filterScriptFiles(scriptFiles, src, extensions);

    try {

      const report = lintScriptFiles(filteredScriptFiles, extensions);

      tradie.emit('scripts.linting.finished', {
        time: Date.now() - startTime,
        errors: report.errorCount
      });

      if (report.errorCount > 0) {
        resolve(-1);
      } else {
        resolve(0);
      }

    } catch (error) {
      reject(error);
    }

  });

}
