'use strict';
const chalk = require('chalk');
const through = require('through2');

module.exports = function(options) {
  return through(
    function(chunk, enc, callback) {
      this.push(chalk.red(chunk.toString()));
      callback();
    }
  );
};