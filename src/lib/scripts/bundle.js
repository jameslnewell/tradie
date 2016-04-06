import path from 'path';
import mkdirp from 'mkdirp';
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
 * @param {array}         [options.plugins]
 * @param {array}         [options.extensions]
 * @param {EventEmitter}  [options.emitter]
 * @param {function}      [options.onChange]
 * @param {function}      [options.node]
 */
function createAppBundle(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = options.src;
  const dest = options.dest;
  const libraries = options.libraries;
  const transforms = options.transforms;
  const plugins = options.plugins;
  const extensions = options.extensions;
  const emitter = options.emitter;
  const onChange = options.onChange;
  const node = options.node;

  //create the bundler
  const bundler = createBundler({
    debug,
    watch,
    src,
    dest,
    transforms,
    plugins,
    extensions,
    emitter,
    node
  });

  //exclude the vendor packages so they're only in vendor.js - what about their deps?
  if (!node) {
    bundler.external(libraries);
  }

  bundler.on('update', files => {
    if (typeof onChange === 'function') onChange(files);
    createBundle({
      debug,
      src,
      dest,
      emitter,
      bundler
    });
  });

  //bundle the scripts and write to file
  return createBundle({
    debug,
    src,
    dest,
    emitter,
    bundler
  })
    .then(result => ({...result, bundler}))
  ;

}

/**
 * Create an app script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.watch]
 * @param {string}        [options.dest]      The destination file
 * @param {array}         [options.libraries]
 * @param {array}         [options.transforms]
 * @param {array}         [options.plugins]
 * @param {array}         [config.extensions]
 * @param {EventEmitter}  [options.emitter]
 */
function createVendorBundle(options) {

  const debug = options.debug;
  const watch = options.watch;
  const src = null;
  const dest = options.dest;
  const libraries = options.libraries;
  const transforms = []; //options.transforms; //don't run transforms?
  const plugins = []; //options.plugins; //don't run transforms?
  const extensions = options.extensions;
  const emitter = options.emitter;

  //create the bundler
  const bundler = createBundler({
    debug,
    watch,
    src,
    dest,
    transforms,
    plugins,
    extensions,
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
  })
    .then(result => ({...result, bundler}))
  ;

}

/**
 * Create script bundles
 *
 * @param {object}        config
 * @param {string}        [config.src]       The source directory
 * @param {string}        [config.dest]      The destination directory
 * @param {array}         [config.bundles]
 * @param {array}         [config.libraries]
 * @param {array}         [config.transforms]
 * @param {array}         [config.plugins]
 * @param {array}         [config.extensions]
 *
 * @param {object}        args
 * @param {string}        [args.env]
 * @param {string}        [args.watch]
 *
 * @param {function}      emitter
 * @param {function}      onChange
 */
export default function({args, config, emitter, onChange}) {

  const debug = args.env !== 'production';
  const watch = args.watch;
  const src = config.src;
  const dest = config.dest;
  const bundles = config.bundles;
  const libraries = config.libraries;
  const transforms = config.transforms;
  const plugins = config.plugins;
  const extensions = config.extensions;

  let streams = [];

  let totalTime = 0;
  let totalSize = 0;

  emitter.emit('scripts.bundling.started');
  emitter.on('scripts.bundle.finished', result => {

    if (result.time > totalTime) {
      totalTime = result.time;
    }

    totalSize += result.size || 0;

  });

  return new Promise((resolve, reject) => {
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
            plugins,
            extensions,
            emitter
          })
        ]);
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
            dest: path.join(dest, path.dirname(file), path.basename(file, path.extname(file)) + '.js'),
            libraries,
            transforms,
            plugins,
            extensions,
            emitter,
            onChange,
            node: path.basename(file, path.extname(file)) === 'server'
          });

        }
      ));

      Promise.all(streams)
        .then(
          results => {

            const hasErrors = results.reduce(
              (accum, next) => accum || Boolean(next.error), false
            );

            emitter.emit('scripts.bundling.finished', {
              src,
              dest,
              count: streams.length,
              time: totalTime,
              size: totalSize,
              error: hasErrors
            });

            if (watch) {

              //stop watching and exit on CTL-C
              process.on('SIGINT', () => {
                results.forEach(({bundler}) => bundler.close());
                resolve(0);
              });

            } else {
              resolve(hasErrors ? -1 : 0);
            }
          }
        );
    });
  });

}

//TODO: check bundle names - vendor.js and common.js are special and not allowed
