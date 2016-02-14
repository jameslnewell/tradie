'use strict';
const fs = require('fs');
const path = require('path');
const browserify = require('browserify');
const incremental = require('browserify-incremental');
const watchify = require('watchify');
const createBundle = require('./createBundle');

const defaultExtensions = [
  '.js', '.jsx', '.json'
];

/**
 * Create a script bundler
 * @param {object}        options
 * @param {boolean}       [options.debug]       Whether to bundle debug information
 * @param {boolean}       [options.watch]       Whether to watch files for changes
 * @param {string|array}  [options.src]         The source file(s)
 * @param {string}        [options.dest]        The output file
 * @param {array}         [options.transforms]  The transforms
 * @param {array}         [options.plugins]     The plugins
 */
export default function(options) {

  const debug = options.debug || false;
  const watch = options.watch || false;
  const src = options.src;
  const dest = options.dest;
  const transforms = options.transforms || [];
  const plugins = options.plugins || [];

  const config = {
    debug,
    extensions: defaultExtensions
  };

  //create bundler
  //use `browserify-incremental` for development builds but not production
  // => it doesn't notice when `envify` variables change and the cache should be busted
  // => it forces use of full module paths resulting in more bytes
  let bundler = null;
  if (debug) {
    if (dest) {
      config.cacheFile = path.join(path.dirname(dest), `.${path.basename(dest)}.cache`);
    }
    bundler = incremental(config);
  } else {
    bundler = browserify(config);
    bundler.transform('envify', {global: true, NODE_ENV: 'production'})
  }

  //configure entry file
  if (src) {
    bundler.add(src);
  }

  //configure transforms
  transforms.forEach(transform => {
    if (Array.isArray(transform)) {
      bundler.transform.apply(bundler, transform);
    } else {
      bundler.transform(transform);
    }
  });

  //configure plugins
  plugins.forEach(plugin => {
    if (Array.isArray(plugin)) {
      bundler.plugin.apply(bundler, plugin);
    } else {
      bundler.plugin(plugin);
    }
  });

  if (watch) {

    //watch for changes
    bundler.plugin(watchify);

    //stop watching on CTRL-C
    process.on('SIGINT', () => {
      bundler.close();
    });

  }

  return bundler;
};
