import fs from 'fs';
import path from 'path';
import every from 'lodash.every';

import getClientBundles from './util/getClientBundles';
import getServerBundles from './util/getServerBundles';

import createVendorConfig from './webpack/createVendorConfig';
import createClientConfig from './webpack/createClientConfig';
import createServerConfig from './webpack/createServerConfig';

import runWebpack from './runWebpack';
import getRevManifestFromStats from './util/getRevManifestFromStats';

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
  const {env, args: {watch}, config: {src, dest, script: {bundles, vendors}}, onChange} = tradie;

  const optimize = env === 'production';
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

  let vendorManifest = {};

  //debounce changes because client/server compilations might have changed the same file and no point
  // linting the same file twice within seconds
  const debounceOnChange = (addedModules, changedModules) => {

    //TODO: remove duplicates
    debouncedAddedModules = debouncedAddedModules.concat(addedModules);
    debouncedChangedModules = debouncedChangedModules.concat(changedModules);

    if (debouncedOnChange + 50 < Date.now()) {

      onChange(debouncedAddedModules, debouncedChangedModules);

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
      stats.errors.forEach(error => console.error(error));
    }

  };

  const createVendorBundle = () => {
    const vendorConfig = createVendorConfig(
      {watch, optimize, onFileChange: debounceOnChange, ...tradie.config}
    );
    return runWebpack(vendorConfig, {}, (err, stats) => {
      if (!err && optimize) {
        vendorManifest = getRevManifestFromStats(stats);
      }
      afterCompile(err, stats);
    });
  };

  const createClientBundle = () => {
    const clientConfig = createClientConfig(
      {watch, optimize, onFileChange: debounceOnChange, ...tradie.config}
    );
    return runWebpack(clientConfig, {watch}, (err, stats) => {
      if (!err && optimize) {
        const manifest = {...vendorManifest, ...getRevManifestFromStats(stats)};
        //TODO: cleanup old files???
        fs.writeFileSync(path.join(dest, 'rev-manifest.json'), JSON.stringify(manifest, null, 2));
      }
      afterCompile(err, stats);
    });
  };

  const createServerBundle = () => {
    const serverConfig = createServerConfig(
      {watch, optimize, onFileChange: debounceOnChange, ...tradie.config}
    );
    return runWebpack(serverConfig, {watch}, afterCompile);
  };

  if (clientBundles.length > 0) {
    if (vendors.length > 0) {
      promises.push(
        createVendorBundle()
          .then(code => {
            if (code === 0) {
              return createClientBundle();
            } else {
              return -1;
            }
          })
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
    .then(codes => {
      if (every(codes, code => code === 0)) {
        return 0;
      } else {
        return -1;
      }
    })
    .then(code => {

      //FIXME: errors are getting output twice - once for scripts and errors

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
