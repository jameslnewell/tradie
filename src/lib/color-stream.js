import chalk from 'chalk';
import through from 'through2';

module.exports = function() {
  return through(
    chunk, enc, callback => {
      push(chalk.red(chunk.toString()));
      callback();
    }
  );
};
