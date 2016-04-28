import path from 'path';
import every from 'lodash.every';

import runWebpack from './runWebpack';

import getClientBundles from './configuration/getClientBundles';
import createVendorConfig from './configuration/createVendorConfig';
import createClientConfig from './configuration/createClientConfig';

import getServerBundles from './configuration/getServerBundles';
import createServerConfig from './configuration/createServerConfig';

/**
 * Create script bundles
 *
 * @param {object}        config
 * @param {string}        [config.src]       The source directory
 * @param {string}        [config.dest]      The destination directory
 * @param {array}         [config.bundles]
 * @param {array}         [config.vendor]
 * @param {array}         [config.loaders]
 * @param {array}         [config.plugins]
 * @param {array}         [config.extensions]
 * @param {array}         [config.externals]
 *
 * @param {object}        args
 * @param {string}        [args.env]
 * @param {string}        [args.watch]
 *
 * @param {function}      emitter
 */
export default function(tradie) {
  const {env, args: {watch}, config: {src, dest, scripts: {bundles, vendors}}, onChange} = tradie;

  const promises = [];
  const clientBundles = getClientBundles(bundles);
  const serverBundles = getServerBundles(bundles);

  let scriptsCount = 0;
  let scriptsErrors = [];
  let scriptsTotalSize = 0;
  let scriptsTotalTime = 0;

  let stylesCount = 0;
  let stylesTotalSize = 0;
  let stylesTotalTime = 0;

  let debouncedOnChange = null;
  let debouncedAddedModules = [];
  let debouncedChangedModules = [];

  //debounce changes because client/server compilations might have changed the same file and no point
  // linting the same file twice within seconds
  const debounceOnChange = (addedModules, changedModules) => {

    //TODO: remove duplicates
    debouncedAddedModules = debouncedAddedModules.concat(addedModules);
    debouncedChangedModules = debouncedChangedModules.concat(changedModules);

    if (debouncedOnChange + 50 < Date.now()) {

      onChange(addedModules, changedModules);

      //reset debounce
      debouncedOnChange = Date.now();
      debouncedAddedModules = [];
      debouncedChangedModules = [];

    }

  };

  const afterCompile = (err, stats) => {

    if (err) {
      //FIXME:
      console.log('HANDLE ERRORS better!', err);
      console.log(stats);
      return;
    }

    scriptsErrors = scriptsErrors.concat(stats.errors);
    scriptsTotalTime += stats.time;
    stylesTotalTime += stats.time;

    //emit synthetic (cause webpack) end of bundling events for script bundles
    stats.assets
      .forEach(asset => {

        if (path.extname(asset.name) === '.js') {

          scriptsCount += 1;
          scriptsTotalSize += asset.size;

          tradie.emit('scripts.bundle.finished', {
            src: path.join(src, asset.name),
            dest: path.join(dest, asset.name),
            size: asset.size,
            time: stats.time
          });

        } else if (path.extname(asset.name) === '.css') {

          stylesCount += 1;
          stylesTotalSize += asset.size;

          tradie.emit('styles.bundle.finished', {
            src: path.join(src, asset.name),
            dest: path.join(dest, asset.name),
            size: asset.size,
            time: stats.time
          });

        }

      })
    ;

    //FIXME:
    if (watch && stats.errors.length) {
      console.log(stats.errors);
    }

  };

  const createVendorBundle = () => {
    const vendorConfig = createVendorConfig(
      {...tradie, onChange: debounceOnChange}
    );
    return runWebpack(vendorConfig, {}, afterCompile);
  };

  const createClientBundle = () => {
    const clientConfig = createClientConfig(
      {...tradie, onChange: debounceOnChange}
    );
    return runWebpack(clientConfig, {watch}, afterCompile);
  };

  const createServerBundle = () => {
    const serverConfig = createServerConfig(
      {...tradie, onChange: debounceOnChange}
    );
    return runWebpack(serverConfig, {watch}, afterCompile);
  };

  if (clientBundles.length > 0) {
    if (vendors.length > 0) {
      promises.push(
        createVendorBundle()
          .then(code => (code === 0 ? createClientBundle() : -1))
      );
    } else {
      promises.push(createClientBundle());
    }
  }

  if (serverBundles.length > 0) {
    promises.push(createServerBundle());
  }

  if (clientBundles.length === 0 && serverBundles.length === 0) {
    //FIXME: emit `scripts.bundling.finished` when 0 scripts were bundled
  }

  return Promise.all(promises)
    .then(codes => every(codes, code => code === 0) ? 0 : -1)
    .then(code => {

      if (!watch) {
        tradie.emit('scripts.bundling.finished', {
          src,
          dest,
          count: scriptsCount,
          time: scriptsTotalTime,
          size: scriptsTotalSize,
          errors: scriptsErrors //FIXME:
        });
        tradie.emit('styles.bundling.finished', {
          src,
          dest,
          count: stylesCount,
          time: stylesTotalTime,
          size: stylesTotalSize,
          errors: scriptsErrors //FIXME:
        });
      }
      return code;
    })
  ;
}
