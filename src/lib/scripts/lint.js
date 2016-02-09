'use strict';
const CLIEngine = require('eslint').CLIEngine;

function lint(files) {

  const cli = new CLIEngine({});
  const report = cli.executeOnFiles([].concat(files));
  const formatter = cli.getFormatter('stylish');

  if (report.errorCount + report.warningCount > 0) {
    console.log(formatter(report.results));
  }

  return report.errorCount;
}

module.exports = function(config, options, emitter) {
  return new Promise((resolve, reject) => {

    try {

      emitter.emit('lint:start');
      const startTime = Date.now();
      const errors = lint(config.src);
      emitter.emit('lint:finish', {
        time: Date.now() - startTime,
        errors
      });

      if (errors > 0) {
        return reject(errors);
      } else {
        return resolve(errors);
      }

    } catch(error) {
      emitter.emit('error', error);
      reject(error);
    }

  });
};
