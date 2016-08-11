import fs from 'fs';
import path from 'path';
import every from 'lodash.every';

import getClientBundles from './util/getClientBundles';
import getServerBundles from './util/getServerBundles';

import createVendorConfig from './webpack/createVendorConfig';
import createClientConfig from './webpack/createClientConfig';
import createServerConfig from './webpack/createServerConfig';

import formatWebpackMessage from './formatWebpackMessage';
import runWebpack from './runWebpack';
import getRevManifestFromStats from './util/getRevManifestFromStats';

//stats.toJson(options) https://webpack.github.io/docs/node.js-api.html#stats-tojson
// {
//   hash: false,
//     version: false,
//   timings: false,
//   assets: false,
//   chunks: false,
//   modules: false,
//   reasons: false,
//   children: false,
//   source: false,
//   errors: false,
//   errorDetails: false,
//   warnings: false,
//   publicPath: false
// }

export default function(options) {
  const {watch, optimize, src, dest, script: {bundles, vendors}, onChange} = options;

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

          options.emit('scripts.bundle.finished', {
            src: path.join(src, asset.name),
            dest: path.join(dest, asset.name),
            size: asset.size,
            time: stats.time
          });

        } else if (path.extname(asset.name) === '.css') {

          stylesCount += 1;
          stylesTotalSize += asset.size;

          options.emit('styles.bundle.finished', {
            src: path.join(src, asset.name),
            dest: path.join(dest, asset.name),
            size: asset.size,
            time: stats.time
          });

        }

      })
    ;

  };

  const createVendorBundle = () => {
    const vendorConfig = createVendorConfig(
      {onFileChange: debounceOnChange, ...options}
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
      {onFileChange: debounceOnChange, ...options}
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
      {onFileChange: debounceOnChange, ...options}
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

      //print errors all together
      if (scriptsErrors.length) {
        scriptsErrors.forEach(
          error => console.error('\n', formatWebpackMessage(options, error), '\n')
        );
      }

      if (!watch) {
        options.emit('scripts.bundling.finished', {
          src,
          dest,
          count: scriptsCount,
          time: scriptsTotalTime,
          size: scriptsTotalSize,
          errors: scriptsErrors
        });
        options.emit('styles.bundling.finished', {
          src,
          dest,
          count: stylesCount,
          time: stylesTotalTime,
          size: stylesTotalSize,
          errors: scriptsErrors
        });
      }

      return code;
    })
  ;
}
