import path from 'path';
import {CLIEngine} from 'eslint';

/**
 * Eslint script files
 * @param   {array}   files
 * @param   {array}   extensions
 * @returns {number}
 */
function eslint(files, extensions) {

  let filteredFiles = [].concat(files);

  //exclude files which don't have an extension (directories) or aren't on the extension list
  filteredFiles = filteredFiles.filter(file => {
    const ext = path.extname(file);
    return ext === '' || extensions.indexOf(ext) !== -1;
  });

  const cli = new CLIEngine({extensions});
  const report = cli.executeOnFiles(filteredFiles);
  const formatter = cli.getFormatter('stylish');

  if (report.errorCount + report.warningCount > 0) {
    console.log(formatter(report.results));
  }

  return report.errorCount;
}

/**
 * Lint script files
 * @param   {array}         files
 * @param   {array}         extensions
 * @param   {EventEmitter}  emitter
 * @returns {Promise}
 */
export default function(files, extensions, emitter) {
  return new Promise((resolve, reject) => {

    try {

      emitter.emit('scripts.linting.started');
      const startTime = Date.now();
      const errors = eslint(files, extensions);
      emitter.emit('scripts.linting.finished', {
        time: Date.now() - startTime,
        errors
      });

      if (errors > 0) {
        return resolve(-1);
      } else {
        return resolve(0);
      }

    } catch (error) {
      reject(error);
    }

  });
};
