'use strict';
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const wait = require('wait-for-event');
const composer = require('sass-composer');
const watcher = require('sass-composer/lib/watcher');
const autoprefixer = require('../autoprefixer-stream');
const minify = require('../minify-stream');
const size = require('../size-stream');

/**
 * Create a style bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {EventEmitter}  [options.emitter]
 * @param {object}        [options.bundler]
 */
function createBundle(options) {

  const debug = options.debug;
  const src = options.src;
  const dest = options.dest;
  const bundler = options.bundler;
  const emitter = options.emitter;

  let args = {src, dest};
  const startTime = Date.now();
  emitter.emit('style:start', args);

  //bundle the styles
  let stream = bundler.compose();

  //autoprefix for older browsers
  stream = stream.pipe(autoprefixer({browsers: 'last 2 versions'}));

  //minify if we're not debugging
  if (!debug) {
    stream = stream.pipe(minify());
  }

  //write to a file
  return stream
    .pipe(size(size => args.size = size))
    .pipe(fs.createWriteStream(dest))
    .on('finish', () => {
      args.time = Date.now() - startTime;
      emitter.emit('style:finish', args)
    })
  ;

}
/**
 * Create a style bundler
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {EventEmitter}  [options.emitter]
 */
function createBundler(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const emitter = options.emitter;

  //configure the bundler
  let bundler = composer()
    .entry(src)
    .use(composer.plugins.url({
      transforms: [
        composer.plugins.url.transforms.hashed({
          dir: path.dirname(dest)
        })
      ]
    }))
  ;

  if (watch) {
    bundler = watcher(bundler);
    bundler.on('change', () => createBundle({
      debug,
      src,
      dest,
      bundler,
      emitter
    }))
  }

  return bundler;
}

/**
 * Create an app script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.vendor]
 * @param {EventEmitter}  [options.emitter]
 * @returns {composer}
 */
function createAppBundle(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const vendor = options.vendor;
  const emitter = options.emitter;

  const bundler = createBundler({
    debug,
    watch,
    src,
    dest,
    emitter
  });

  return createBundle({
    debug,
    src,
    dest,
    emitter,
    bundler
  });

}

/**
 * Create style bundles
 * @param   {object}  options
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.src]       The source directory
 * @param {string}        [options.dest]      The destination directory
 * @param {array}         [options.bundle]
 * @param {array}         [options.vendor]
 * @returns {Promise}
 */
module.exports = function(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const bundle = options.bundle;
  const vendor = options.vendor;
  const transform = options.transform;
  const emitter = new EventEmitter();

  let streams = [];

  let totalTime = 0;
  let totalSize = 0;

  emitter.emit('start');
  emitter.on('style:finish', function(args) {
    totalTime += args.time;
    totalSize += args.size;
  });

  //if (vendor.length) {
  //  streams = streams.concat([
  //    createVendorBundle({
  //      debug,
  //      watch,
  //      src: null,
  //      dest: path.join(dest, 'vendor.js'),
  //      vendor,
  //      transform,
  //      emitter
  //    })
  //  ])
  //}

  streams = streams.concat(bundle.map(
    file => createAppBundle({
      debug,
      watch,
      src: path.join(src, file),
      dest: path.join(dest, file),
      vendor,
      emitter
    })
  ));


  //TODO: waitForAll needs to be updated to handle errors
  wait.waitForAll(
    'finish',
    streams,
    err => {
      if (err) {
        emitter.emit('error', err);
      } else {
        emitter.emit('finish', {
          src,
          dest,
          count: streams.length,
          time: totalTime,
          size: totalSize
        });
      }
    }
  );

  return emitter;
};
