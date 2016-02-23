'use strict';
const CLIEngine = require('eslint').CLIEngine;

/**
 * Eslint script files
 * @param   {array}   files
 * @returns {number}
 */
function eslint(files) {

  const cli = new CLIEngine({});
  const report = cli.executeOnFiles([].concat(files));
  const formatter = cli.getFormatter('stylish');

  if (report.errorCount + report.warningCount > 0) {
    console.log(formatter(report.results));
  }

  return report.errorCount;
}

/**
 * Lint script files
 * @param   {array}         files
 * @param   {EventEmitter}  emitter
 * @returns {Promise}
 */
module.exports = function(files, emitter) {
  return new Promise((resolve, reject) => {

    try {

      emitter.emit('scripts.linting.started');
      const startTime = Date.now();
      const errors = eslint(files);
      emitter.emit('scripts.linting.finished', {
        time: Date.now() - startTime,
        errors
      });

      if (errors > 0) {
        return reject();
      } else {
        return resolve();
      }

    } catch (error) {
      emitter.emit('error', error);
      reject(error);
    }

  });
};
