'use strict';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
import pipe from 'promisepipe';
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
  emitter.emit('styles.bundle.started', args);

  let streams = [

    //bundle the styles
    bundler.compose(),

    //autoprefix for older browsers
    autoprefixer({browsers: 'last 2 versions'})

  ];

  //minify if we're not debugging
  if (!debug) {
    streams.push(minify());
  }

  streams.push(size(size => args.size = size));
  streams.push(fs.createWriteStream(dest));

  //write to a file
  return pipe.apply(null, streams)
    .then(
      () => {
        args.time = Date.now() - startTime;
        emitter.emit('styles.bundle.finished', args);
        return {error: null};
      },
      error => {
        args.time = Date.now() - startTime;
        args.error = error;
        emitter.emit('bundle:finish', args);
        return {error};
      }
    )
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
    }));
  }

  return bundler;
}

/**
 * Create an app script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.dest]      The source file
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
 * @param {object}        [config]
 * @param {string}        [config.src]       The source directory
 * @param {string}        [config.dest]      The destination directory
 * @param {array}         [config.bundle]
 * @param {array}         [config.vendor]
 * @param {object}        [args]
 * @param {string}        [args.env]
 * @param {string}        [args.watch]
 * @returns {Promise}
 */
export default function({args, config, emitter}) {

  const debug = args.env !== 'production';
  const watch = args.watch;
  const src = config.src;
  const dest = config.dest;
  const bundles = config.bundles;
  const libraries = config.libraries;
  const transforms = config.transforms;

  let streams = [];

  let totalTime = 0;
  let totalSize = 0;

  emitter.emit('styles.bundling.started');
  emitter.on('styles.bundle.finished', args => {
    totalTime += args.time;
    totalSize += args.size || 0;
  });

  return new Promise((resolve, reject) => {
    mkdirp(dest, err => {
      if (err) return emitter.emit('error', err);

      //TODO: libraries

      //create bundle streams
      streams = streams.concat(bundles.map(
        file => createAppBundle({
          debug,
          watch,
          src: path.join(src, file),
          dest: path.join(dest, path.basename(file, path.extname(file))+'.css'),
          libraries,
          emitter
        })
      ));

      //wait for all the streams to complete
      Promise.all(streams)
        .then(
          results => {

            const hasErrors = results.reduce(
              (accum, next) => accum || Boolean(next.error), false
            );

            emitter.emit('styles.bundling.finished', {
              src,
              dest,
              count: streams.length,
              time: totalTime,
              size: totalSize,
              error: hasErrors
            });

            resolve(hasErrors ? -1 : 0);
          }
        )
      ;

    });
  });

};

//TODO: check bundle names - vendor.js and common.js are special and not allowed