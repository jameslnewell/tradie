'use strict';
var fs = require('fs');
var path = require('path');
const wait = require('wait-for-event');
var composer = require('sass-composer');
var watcher = require('sass-composer/lib/watcher');
const autoprefixer = require('../autoprefixer-stream');
const minify = require('../minify-stream');
const defaults = require('./defaults');

/**
 * Bundle the application style
 * @param   {object}  options
 *
 * @param   {boolean} config.debug
 * @param   {boolean} config.watch
 *
 * @param   {string}  config.src
 * @param   {string}  config.dest
 * @param   {string}  config.file
 * @param   {array}   config.external
 *
 * @returns {composer}
 */
function bundleAppStyle(options) {

  const input = path.join(options.src, options.file);
  const output = path.join(options.dest, path.basename(options.file, path.extname(options.file)))+'.css';

  //configure the bundler
  let bundler = composer()
    .entry(input)
    .use(composer.plugins.url({
      transforms: [
        composer.plugins.url.transforms.hashed({
          dir: options.dest
        })
      ]
    }))
  ;

  const createBundle = () => {

    //bundle the styles
    let stream = bundler.compose();

    //autoprefix for older browsers
    stream = stream.pipe(autoprefixer({browsers: 'last 2 versions'}));

    //minify if we're not debugging
    if (!options.debug) {
      stream = stream.pipe(minify());
    }

    //write to a file
    return stream
      .pipe(fs.createWriteStream(output))
    ;

  };

  if (options.watch) {
    bundler = watcher(bundler);
    bundler.on('change', createBundle)
  }

  return createBundle();
}

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

  let streams = [
    //bundleVendorStyle({ //TODO:
    //
    //  debug: options.debug,
    //  watch: options.watch,
    //
    //  dest: finalConfig.dest,
    //  external: finalConfig.vendor,
    //  transform: finalConfig.transform
    //
    //})
  ];

  streams = streams.concat(mergedConfig.bundle.map(
    bundle => bundleAppStyle({

      debug: options.debug,
      watch: options.watch,

      src: mergedConfig.src,
      dest: mergedConfig.dest,
      file: bundle,
      external: mergedConfig.vendor

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
