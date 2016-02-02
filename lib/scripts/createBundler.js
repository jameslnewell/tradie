'use strict';
const fs = require('fs');
const path = require('path');
const browserify = require('browserify');
const incremental = require('browserify-incremental');
const watchify = require('watchify');
const createBundle = require('./createBundle');

const extensions = [
  '.js', '.jsx', '.json'
];

/**
 * Create a script bundler
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.transform]
 * @param {function}      [options.onChange]
 * @param {EventEmitter}  [options.emitter]
 */
module.exports = function createBundler(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const transform = options.transform;
  const onChange = options.onChange;
  const emitter = options.emitter;

  const config = {
    debug,
    extensions
  };

  //create bundler
  //use `browserify-incremental` for development builds but not production
  // => it doesn't notice when `envify` variables change and the cache should be busted
  // => it forces use of full module paths resulting in more bytes
  let bundler = null;
  if (debug) {
    config.cacheFile = path.join(path.dirname(dest), `.${path.basename(dest)}.cache`);
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
    bundler.on('update', files => {
      onChange(files);
      createBundle({
        debug,
        src,
        dest,
        bundler,
        emitter
      });
    });

    //stop watching on CTRL-C
    process.on('SIGINT', () => {
      bundler.close();
      process.exit();
    });

  }

  return bundler;
};
