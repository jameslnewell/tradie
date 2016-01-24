'use strict';
const path = require('path');
const chalk = require('chalk');
const humanize = require('humanize-duration');
const filesize = require('file-size');

module.exports = {};

/**
 * Log an error
 * @param {string} msg
 */
module.exports.error = function(msg) {
  console.log(chalk.red(msg));
};

/**
 * Log when a bundle has finished
 * @param {string}  type
 * @param {bool}    ok
 * @param {object}  args
 * @param {object}  [args.time]
 * @param {object}  [args.size]
 */
module.exports.bundleFinished = function(type, ok, args) {

  let msg = '';
  const basename = path.basename(args.dest);
  const size = filesize(args.size).human('jedec').replace('Bytes', 'B');
  const duration = humanize(args.time);

  if (!args.verbose) {
    return;
  }

  if (ok) {
    msg = chalk.blue(` => ${type} ${basename} bundled in ${duration} - ${size}`);
  } else {
    msg = chalk.red(` => en error occurred while bundling ${type}s  ${basename}`);
  }

  console.log(msg);
};

/**
 * Log when all the bundles have finished
 * @param {string}  type
 * @param {bool}    ok
 * @param {object}  args
 * @param {object}  [args.count]
 * @param {object}  [args.time]
 * @param {object}  [args.size]
 */
module.exports.bundlesFinished = function(type, ok, args) {

  let msg = '';
  const count = args.count;
  const size = filesize(args.size).human('jedec').replace('Bytes', 'B');
  const duration = humanize(args.time);

  if (ok) {
    if (args.count) {
      msg = chalk.green(` => ${count} ${type}s bundled in ${duration} - ${size}`)
    }
  } else {
    chalk.red(` => en error occurred while bundling ${type}s`)
  }

  console.log(msg);
};

module.exports.scriptBundleFinished = function(ok, args) {
  return this.bundleFinished('script', ok, args);
};

module.exports.scriptBundlesFinished = function(ok, args) {
  return this.bundlesFinished('script', ok, args);
};

module.exports.styleBundleFinished = function(ok, args) {
  return this.bundleFinished('style', ok, args);
};

module.exports.styleBundlesFinished = function(ok, args) {
  return this.bundlesFinished('style', ok, args);
};