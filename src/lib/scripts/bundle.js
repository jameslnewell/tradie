import path from 'path';
import mkdirp from 'mkdirp';
import waitForAll from '../waitForAll';
import createBundle from './createBundle';
import createBundler from './createBundler';

/**
 * Create an app script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.libraries]
 * @param {array}         [options.transforms]
 * @param {EventEmitter}  [options.emitter]
 */
function createAppBundle(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const libraries = options.libraries;
  const transforms = options.transforms;
  const emitter = options.emitter;

  //create the bundler
  const bundler = createBundler({
    debug,
    watch,
    src,
    dest,
    transforms,
    emitter
  });

  //exclude the vendor packages
  bundler.external(libraries);

  bundler.on('update', () => createBundle({
    debug,
    src,
    dest,
    emitter,
    bundler
  }));

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
 * @param {array}         [options.libraries]
 * @param {array}         [options.transforms]
 * @param {EventEmitter}  [options.emitter]
 */
function createVendorBundle(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = null;
  const dest = options.dest;
  const libraries = options.libraries;
  const transforms = options.transforms;
  const emitter = options.emitter;

  //create the bundler
  const bundler = createBundler({
    debug,
    watch,
    src,
    dest,
    transforms,
    emitter
  });

  //include vendor packages
  bundler.require(libraries);

  //bundle the scripts and write to file
  return createBundle({
    debug,
    src,
    dest,
    bundler,
    emitter
  });

}

/**
 * Create script bundles
 * @param {object}        config
 * @param {string}        [config.src]       The source directory
 * @param {string}        [config.dest]      The destination directory
 * @param {array}         [config.bundles]
 * @param {array}         [config.libraries]
 * @param {array}         [config.transforms]
 * @param {object}        options
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {function}      [options.onChange]
 * @param {function}      emitter
 */
module.exports = function(config, options, emitter) {
  return new Promise((resolve, reject) => {

    const debug = options.debug;
    const watch = options.watch;
    const src = config.src;
    const dest = config.dest;
    const bundles = config.bundles;
    const libraries = config.libraries;
    const transforms = config.transforms;

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

      if (libraries.length) {
        streams = streams.concat([
          createVendorBundle({
            debug,
            watch,
            src: null,
            dest: path.join(dest, 'vendor.js'),
            libraries,
            transforms,
            emitter
          })
        ])
      }

      streams = streams.concat(bundles.map(
        file => {

          if (file === 'vendor.js' || file === 'common.js') {
            throw new Error();
          }

          return createAppBundle({
            debug,
            watch,
            src: path.join(src, file),
            dest: path.join(dest, file),
            libraries,
            transforms,
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