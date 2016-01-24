'use strict';
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const wait = require('wait-for-event');
const browserify = require('browserify');
const incremental = require('browserify-incremental');
const watchify = require('watchify');
const uglify = require('../uglify-stream');
const size = require('../size-stream');

const extensions = [
  '.js', '.jsx', '.json'
];

/**
 * Create a script bundle
 * @param {object}  [options]
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
  emitter.emit('script:start', args);

  //create bundle
  let stream = bundler.bundle();

  //optimise bundle
  if (!debug) {
    stream = stream.pipe(uglify());
  }

  //write bundle
  return stream
    .pipe(size(size => args.size = size))
    .pipe(fs.createWriteStream(dest))//TODO: handle error
    .on('finish', () => {
      args.time = Date.now() - startTime;
      emitter.emit('script:finish', args)
    })
  ;

}

/**
 * Create a script bundler
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.transform]
 * @param {EventEmitter}  [options.emitter]
 */
function createBundler(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const transform = options.transform;
  const emitter = options.emitter;

  const config = {
    debug,
    extensions,
    cacheFile: path.join(path.dirname(dest), `.${path.basename(dest)}.cache`)
  };

  //create bundler
  //use `browserify-incremental` for development builds but not production
  // => it doesn't notice when `envify` variables change and the cache should be busted
  // => it forces use of full module paths resulting in more bytes
  let bundler = null;
  if (debug) {
    bundler = incremental(config);
  } else {
    bundler = browserify(config);
    bundler.transform('envify', {global: true, NODE_ENV: 'production'})
  }

  //configure bundler
  if (src) {
    bundler.add(src);
  }

  //configure bundler
  transform.forEach(transform => {
    if (Array.isArray(transform)) {
      bundler.transform.apply(bundler, transform);
    } else {
      bundler.transform(transform);
    }
  });

  if (watch) {

    //watch for changes
    bundler.plugin(watchify);

    //re-bundle when any of the source files change
    bundler.on('update', () => createBundle({
      debug,
      src,
      dest,
      bundler,
      emitter
    }));

    //stop watching on CTRL-C
    process.on('SIGINT', () => {
      bundler.close();
      process.exit();
    });

  }

  return bundler;
}

/**
 * Create an app script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.vendor]
 * @param {array}         [options.transform]
 * @param {EventEmitter}  [options.emitter]
 */
function createAppBundle(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const vendor = options.vendor;
  const transform = options.transform;
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
 * Create an app script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.bundle]
 * @param {array}         [options.vendor]
 * @param {array}         [options.transform]
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
  emitter.on('script:finish', function(args) {
    totalTime += args.time;
    totalSize += args.size;
  });

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
    file => createAppBundle({
      debug,
      watch,
      src: path.join(src, file),
      dest: path.join(dest, file),
      vendor,
      transform,
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

