'use strict';
const fs = require('fs');
const path = require('path');
const wait = require('wait-for-event');
const browserify = require('browserify');
const incremental = require('browserify-incremental');
const watchify = require('watchify');
const uglify = require('../uglify-stream');
const defaults = require('./defaults');

const defaultExtensions = [
  '.js',
  '.jsx',
  '.json'
];

/**
 * Bundle the scripts
 * @param   {object}  config
 * @param   {object}  options
 * @param   {boolean} options.debug
 * @param   {boolean} options.watch
 * @returns {Promise}
 */
module.exports = function(config, options) {
  const mergedConfig = defaults(config);

  /**
   * Create a bundler
   * @param {string} [file] The entry file
   */
  const createBundler = function(file) {
    const bundlerConfig = {
      debug: options.debug,
      extensions: defaultExtensions,
      cacheFile: path.join(mergedConfig.dest, `.${path.basename(file)}.cache`)
    };

    //create the bundler...
    //use `browserify-incremental` for development builds but not production
    // => it doesn't notice when `envify` variables change and the cache should be busted
    // => it forces use of full module paths resulting in more bytes
    let bundler = null;
    if (options.debug) {
      bundler = incremental(bundlerConfig);
    } else {
      bundler = browserify(bundlerConfig);
      bundler.transform('envify', {global: true, NODE_ENV: 'production'})
    }

    //configure the bundler with a script
    if (file) {
      bundler.add(file);
    }

    //configure the bundler with transforms
    mergedConfig.transform.forEach(
      transform => {
        if (Array.isArray(transform)) {
          bundler.transform.apply(bundler, transform);
        } else {
          bundler.transform(transform);
        }
      }
    );

    //configure the bundler to watch for changes until user presses CTRL+C
    if (options.watch) {
      bundler.plugin(watchify);
      bundler.on('update', () => createBundle({
        debug: options.debug,
        file: file,
        bundler: bundler
      }));
      process.on('SIGINT', function() {
        bundler.close();
        process.exit();
      });

    }

    return bundler;
  };

  /**
   *
   * @param   {object}  options
   * @param   {boolean} options.debug
   * @param   {string}  options.file
   * @param   {object}  options.bundler
   * @returns {*}
   */
  function createBundle(options) {

    //bundle the packages
    let stream = options.bundler.bundle();

    //minify if we're not debugging
    if (!options.debug) {
      stream = stream.pipe(uglify());
    }

    //write to a file
    return stream
      .pipe(fs.createWriteStream(options.file))
    ;

  }

  /**
   * Bundle the application script
   * @param   {object}  options
   *
   * @param   {boolean} options.debug
   * @param   {boolean} options.watch
   *
   * @param   {string}  options.src
   * @param   {string}  options.dest
   * @param   {string}  options.file
   * @param   {array}   options.external
   * @param   {array}   options.transform
   *
   * @returns {browserify}
   */
  function bundleAppScript(options) {

    //create the bundler
    const bundler = createBundler(path.join(options.src, options.file));

    //exclude the vendor packages
    bundler.external(options.external);

    //bundle the scripts and write to file
    return createBundle({
      debug: options.debug,
      file: path.join(options.dest, path.basename(options.file)),
      bundler: bundler
    });

  }
  /**
   * Bundle a vendor script
   * @param   {object}  options
   * @param   {string}  options.dest
   * @param   {array}   options.external
   * @param   {array}   options.transform
   * @returns {browserify}
   */
  function bundleVendorScript(options) {

    //create the bundler
    const bundler = createBundler(path.join(options.dest, 'vendor.js'));

    //export the vendor packages
    bundler.require(options.external);

    //bundle the pacakges and write to file
    return createBundle({
      debug: options.debug,
      file: path.join(options.dest, 'vendor.js'),
      bundler: bundler
    });

    //TODO: watch the rc file

  }

  let streams = [];

  if (mergedConfig.vendor.length) {
    streams = streams.concat([
      bundleVendorScript({

        debug: options.debug,
        watch: options.watch,

        dest: mergedConfig.dest,
        external: mergedConfig.vendor,
        transform: mergedConfig.transform

      })
    ])
  }

  streams = streams.concat(mergedConfig.bundle.map(
    bundle => bundleAppScript({

      debug: options.debug,
      watch: options.watch,

      src: mergedConfig.src,
      dest: mergedConfig.dest,
      file: bundle,
      external: mergedConfig.vendor,
      transform: mergedConfig.transform

    })
  ));

  return new Promise((resolve, reject) => {
    wait.waitForAll( //TODO: waitForAll needs to be updated to handle errors
      'finish',
      streams,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });

};
