'use strict';
const path = require('path');
const mkdirp = require('mkdirp');
const waitForAll = require('../waitForAll');
const createBundle = require('./createBundle');
const createBundler = require('./createBundler');

/**
 * Create an app script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.vendor]
 * @param {array}         [options.transform]
 * @param {function}      [options.onChange]
 * @param {EventEmitter}  [options.emitter]
 */
function createAppBundle(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const vendor = options.vendor;
  const transform = options.transform;
  const onChange = options.onChange;
  const emitter = options.emitter;

  //create the bundler
  const bundler = createBundler({
    debug,
    watch,
    src,
    dest,
    transform,
    onChange,
    emitter
  });

  //exclude the vendor packages
  bundler.external(vendor);

  //bundle the scripts and write to file
  return createBundle({
    debug,
    src,
    dest,
    emitter,
    bundler
  });

}

/**
 * Create an app script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.vendor]
 * @param {array}         [options.transform]
 * @param {EventEmitter}  [options.emitter]
 */
function createVendorBundle(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = null;
  const dest = options.dest;
  const transform = options.transform;
  const vendor = options.vendor;
  const emitter = options.emitter;

  //create the bundler
  const bundler = createBundler({
    debug,
    watch,
    src,
    dest,
    emitter,
    transform
  });

  //include vendor packages
  bundler.require(vendor);

  //bundle the scripts and write to file
  return createBundle({
    debug,
    src,
    dest,
    emitter,
    bundler
  });

}

/**
 * Create script bundles
 * @param {object}        [config]
 * @param {string}        [config.src]       The source directory
 * @param {string}        [config.dest]      The destination directory
 * @param {array}         [config.bundle]
 * @param {array}         [config.vendor]
 * @param {array}         [config.transform]
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {function}      [options.onChange]
 */
module.exports = function(config, options, emitter) {
  return new Promise((resolve, reject) => {

    const debug = options.debug;
    const watch = options.watch;
    const src = config.src;
    const dest = config.dest;
    const bundle = config.bundle;
    const vendor = config.vendor;
    const transform = config.transform;
    const onChange = options.onChange;

    let streams = [];

    let totalTime = 0;
    let totalSize = 0;

    emitter.emit('bundles:start');
    emitter.on('bundle:finish', function(args) {
      totalTime += args.time;
      totalSize += args.size;
    });

    mkdirp(dest, err => {

      if (err) return emitter.emit('bundles:finish', {
          src,
          dest,
          error
        }) && reject(err);

      if (vendor.length) {
        streams = streams.concat([
          createVendorBundle({
            debug,
            watch,
            src: null,
            dest: path.join(dest, 'vendor.js'),
            vendor,
            transform,
            emitter
          })
        ])
      }

      streams = streams.concat(bundle.map(
        file => {

          if (file === 'vendor.js' || file === 'common.js') {
            throw new Error();
          }

          return createAppBundle({
            debug,
            watch,
            src: path.join(src, file),
            dest: path.join(dest, file),
            vendor,
            transform,
            onChange,
            emitter
          });

        }
      ));

      //TODO: waitForAll needs to be updated to handle errors
      waitForAll(
        'finish',
        streams,
        error => {
          const args = {
            src,
            dest,
            count: streams.length,
            time: totalTime,
            size: totalSize,
            error
          };
          emitter.emit('bundles:finish', {
            src,
            dest,
            count: streams.length,
            time: totalTime,
            size: totalSize,
            error
          });
          resolve(args);
          if (error) return reject(error);
        }
      );

    });

  });

};

//TODO: check bundle names - vendor.js and common.js are special and not allowed