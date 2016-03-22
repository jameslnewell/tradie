'use strict';
const fs = require('fs');
const path = require('path');
const browserify = require('browserify');
const insertGlobals = require('insert-module-globals');
const incremental = require('browserify-incremental');
const watchify = require('watchify');
const envify = require('envify');
const createBundle = require('./createBundle');

/**
 * Create a script bundler
 * @param {object}        options
 * @param {boolean}       [options.test]        Whether this is for a test build
 * @param {boolean}       [options.debug]       Whether to bundle debug information
 * @param {boolean}       [options.watch]       Whether to watch files for changes
 * @param {string|array}  [options.src]         The source file(s)
 * @param {string}        [options.dest]        The output file
 * @param {array}         [options.transforms]  The transforms
 * @param {array}         [options.plugins]     The transforms
 * @param {array}         [options.extensions]  The extensions
 * @param {array}         [options.node]        Whether we should bundle for node instead of the browser
 */
export default function(options) {

  const test = options.test || false;
  const debug = options.debug || false;
  const watch = options.watch || false;
  const src = options.src;
  const dest = options.dest;
  const transforms = options.transforms || [];
  const plugins = options.plugins || [];
  const extensions = options.extensions || ['js'];
  const node = options.node || false;

  const config = {
    debug,
    extensions: extensions.concat(['.json'])
  };

  //configure for node
  if (node) {

    //--bare
    config.builtins = false; //--no-builtins
    config.commondir = false; //--no-commondir
    config.detectGlobals = false;
    config.insertGlobalVars = { //--insert-global-vars=__filename, __dirname
      __filename: insertGlobals.vars.__filename,
      __dirname: insertGlobals.vars.__dirname
    };

    //--no-browser-field
    config.browserField = false;

  }

  //create bundler
  //use `browserify-incremental` for development builds but not production

  let bundler = null;
  if (!debug) {

    //browserify incremental is a bit dodgey
    // - it doesn't notice when `envify` variables change and the cache should be busted
    // - it forces use of full module paths resulting in more bytes
    bundler = browserify(config);
    bundler.transform(envify, {global: true, NODE_ENV: 'production'});

  } else if (watch || test || !dest) {

    //browserify incremental is a bit dodgey while watching or testing
    // - while watching file change events aren't triggered
    // - while testing the bundle callback may never be called
    config.cache = {};
    config.packageCache = {};
    bundler = browserify(config);

  } else {

    if (dest) {
      config.cacheFile = path.join(path.dirname(dest), `.${path.basename(dest)}.cache`);
    }
    bundler = incremental(config); //TODO: other options to consider: persistify - nowhere as good caching???

  }

  //configure entry file
  if (src) {
    bundler.add(src);
  }

  //configure transforms
  transforms.forEach(transform => {
    if (Array.isArray(transform)) {
      bundler.transform(...transform);
    } else {
      bundler.transform(transform);
    }
  });

  //configure plugins
  plugins.forEach(plugin => {
    if (Array.isArray(plugin)) {
      bundler.plugin(...plugin);
    } else {
      bundler.plugin(plugin);
    }
  });

  //watch for changes
  if (watch) {
    bundler.plugin(watchify);
  }

  return bundler;
};
