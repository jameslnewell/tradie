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

  emitter.emit('lint:start');
  const errors = lint(config.src);
  emitter.emit('lint:finish', {errors});

  if (errors > 0) {
    return Promise.reject(errors);
  } else {
    return Promise.resolve(errors);
  }

};
