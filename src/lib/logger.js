'use strict';
const path = require('path');
const chalk = require('chalk');
const humanize = require('humanize-duration');
const filesize = require('file-size');

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
   * @param {object}  args
   * @param {object}  [args.time]
   * @param {object}  [args.size]
   */
  const bundleFinished = (type, args) => {

    if (!verbose) {//FIXME:
      return;
    }

    const basename = path.basename(args.dest);
    const size = filesize(args.size).human('jedec').replace('Bytes', 'B');
    const duration = humanize(args.time);
    let msg = ` => ${type} ${chalk.underline(basename)} bundled in ${duration} - ${size}`;

    if (args.error) {
      msg = chalk.red(msg);
      msg += '\n\t'+chalk.red(args.error);
    } else {
      msg = chalk.blue(msg);
    }

    console.log(msg);
  };

  /**
   * Log when all the bundles have finished
   * @param {string}  type
   * @param {object}  args
   * @param {object}  [args.count]
   * @param {object}  [args.time]
   * @param {object}  [args.size]
   * @param {Error}   [args.error]
   */
  const bundlesFinished = (type, args) => {

    const error = args.error;
    const count = args.count;
    const size = filesize(args.size).human('jedec').replace('Bytes', 'B');
    const duration = humanize(args.time);
    let msg = ` => ${count} ${type}s bundled in ${duration} - ${size}`;

    if (!args.error) {
      if (args.count) {
        msg = chalk.green(msg);
      }
    } else {
      msg = chalk.bold.red(msg);
    }

    console.log(msg);
  };

  const scriptBundleFinished = args => {
    return bundleFinished('script', args);
  };

  const scriptBundlesFinished = args => {
    return bundlesFinished('script', args);
  };

  const styleBundleFinished = args => {
    console.log('bundle styke', args);
    return bundleFinished('style', args);
  };

  const styleBundlesFinished = args => {
    return bundlesFinished('style', args);
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