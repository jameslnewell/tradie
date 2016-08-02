import path from 'path';
import chalk from 'chalk';
import humanize from 'humanize-duration';
import filesize from 'file-size';

export default function(options) {

  /**
   * Log an error
   * @param {string} msg
   */
  const error = msg => {
    console.log(chalk.red(msg));
  };

  const lintingFinished = (args) => {
    const msg = ` => scripts linted in ${humanize(args.time)}`;
    if (args.errors === 0) {
      console.log(chalk.green(msg));
    } else {
      console.log(chalk.red(msg));
    }
  };

  /**
   * Log when a bundle has finished
   * @param {string}  type
   * @param {object}  result
   * @param {object}  [result.time]
   * @param {object}  [result.size]
   */
  const bundleFinished = (type, result) => {

    const basename = path.basename(result.dest);
    const size = filesize(result.size).human('jedec').replace('Bytes', 'B');
    const duration = result.time ? humanize(result.time) : '? seconds';
    let msg = ` => ${type} ${chalk.underline(basename)} bundled in ${duration} - ${size}`;

    if (result.error) {
      msg = chalk.red(msg);
      msg += '\n\t' + chalk.red(result.error.stack);
    } else {
      msg = chalk.blue(msg);
    }

    console.log(msg);
  };

  /**
   * Log when all the bundles have finished
   * @param {string}        type
   * @param {object}        result
   * @param {object}        [result.count]
   * @param {object}        [result.time]
   * @param {object}        [result.size]
   * @param {Array<string>} [result.errors]
   */
  const bundlingFinished = (type, result) => {

    const count = result.count;
    const size = filesize(result.size).human('jedec').replace('Bytes', 'B');
    const duration = humanize(result.time);
    let msg = ` => ${count} ${type}s bundled in ${duration} - ${size}`;

    if (result.errors && result.errors.length > 0) {
      msg = chalk.bold.red(msg) + '\n' + result.errors;
    } else if (result.count) {
      msg = chalk.green(msg);
    }

    console.log(msg);
  };

  const scriptBundleFinished = result => bundleFinished('script', result);
  const scriptBundlingFinished = result => bundlingFinished('script', result);

  const styleBundleFinished = result => bundleFinished('style', result);
  const styleBundlingFinished = result => bundlingFinished('style', result);

  return {
    error,
    lintingFinished,
    scriptBundleFinished,
    scriptBundlingFinished,
    styleBundleFinished,
    styleBundlingFinished
  };

}
