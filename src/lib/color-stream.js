import chalk from 'chalk';
import through from 'through2';

module.exports = function() {
  return through(
    function(chunk, enc, callback) {
      this.push(chalk.red(chunk.toString())); //eslint-disable-line
      callback();
    }
  );
};
