'use strict';
import path from 'path';
import chalk from 'chalk';
import humanize from 'humanize-duration';
import filesize from 'file-size';

module.exports = function(options) {

  const verbose = options.verbose;

  /**
   * Log an error
   * @param {string} msg
   */
  const error = msg => {
    console.log(chalk.red(msg));
  };

  const lintFinished = (args) => {
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

    if (!verbose) {//FIXME:
      return;
    }

    const basename = path.basename(result.dest);
    const size = filesize(result.size).human('jedec').replace('Bytes', 'B');
    const duration = humanize(result.time);
    let msg = ` => ${type} ${chalk.underline(basename)} bundled in ${duration} - ${size}`;

    if (result.error) {
      msg = chalk.red(msg);
      msg += '\n\t'+chalk.red(result.error);
    } else {
      msg = chalk.blue(msg);
    }

    console.log(msg);
  };

  /**
   * Log when all the bundles have finished
   * @param {string}  type
   * @param {object}  result
   * @param {object}  [result.count]
   * @param {object}  [result.time]
   * @param {object}  [result.size]
   * @param {Error}   [result.error]
   */
  const bundlesFinished = (type, result) => {

    const error = result.error;
    const count = result.count;
    const size = filesize(result.size).human('jedec').replace('Bytes', 'B');
    const duration = humanize(result.time);
    let msg = ` => ${count} ${type}s bundled in ${duration} - ${size}`;

    if (!result.error) {
      if (result.count) {
        msg = chalk.green(msg);
      }
    } else {
      msg = chalk.bold.red(msg);
    }

    console.log(msg);
  };

  const scriptBundleFinished = result => {
    return bundleFinished('script', result);
  };

  const scriptBundlesFinished = result => {
    return bundlesFinished('script', result);
  };

  const styleBundleFinished = result => {
    return bundleFinished('style', result);
  };

  const styleBundlesFinished = result => {
    return bundlesFinished('style', result);
  };

  return {
    error,
    lintFinished,
    scriptBundleFinished,
    scriptBundlesFinished,
    styleBundleFinished,
    styleBundlesFinished
  };

};
