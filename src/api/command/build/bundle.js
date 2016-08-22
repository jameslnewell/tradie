import fs from 'fs';
import path from 'path';

import getClientBundles from '../../util/getClientBundles';
import getServerBundles from '../../util/getServerBundles';

import createVendorConfig from '../../webpack/createVendorConfig';
import createClientConfig from '../../webpack/createClientConfig';
import createServerConfig from '../../webpack/createServerConfig';

import runWebpack from '../../runWebpack';
import getRevManifestFromStats from '../../util/getRevManifestFromStats';
import createStatCollector from './createStatCollector';

export default function(options) {
  const {watch, optimize, src, dest, script: {bundles, vendors}, onChange} = options;

  const promises = [];
  const clientBundles = getClientBundles(bundles);
  const serverBundles = getServerBundles(bundles);

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

  const collector = createStatCollector(options);

  const createVendorBundle = () => {
    const vendorConfig = createVendorConfig(
      {onFileChange: debounceOnChange, ...options}
    );
    return runWebpack(vendorConfig, {}, stats => {
      if (optimize) {
        vendorManifest = getRevManifestFromStats(stats);
      }
      collector.collect('vendor', stats);
    });
  };

  const createClientBundle = () => {
    const clientConfig = createClientConfig(
      {onFileChange: debounceOnChange, ...options}
    );
    return runWebpack(clientConfig, {watch}, stats => {
      if (optimize) {
        const manifest = {...vendorManifest, ...getRevManifestFromStats(stats)};
        //TODO: cleanup old files???
        fs.writeFileSync(path.join(dest, 'rev-manifest.json'), JSON.stringify(manifest, null, 2));
      }
      collector.collect('client', stats);
    });
  };

  const createServerBundle = () => {
    const serverConfig = createServerConfig(
      {onFileChange: debounceOnChange, ...options}
    );
    return runWebpack(serverConfig, {watch}, stats => collector.collect('server', stats));
  };

  //create the client bundles
  if (clientBundles.length > 0) {
    if (vendors.length > 0) {
      promises.push(
        createVendorBundle()
          .then(createClientBundle)
      );
    } else {
      promises.push(createClientBundle());
    }
  }

  //create the server bundles
  if (serverBundles.length > 0) {
    promises.push(createServerBundle());
  }

  //notify the user when the bundles have been built
  return Promise.all(promises)
    .then(() => {

      collector.summarize();

      //handle errors
      if (collector.hasErrors()) {
        return Promise.resolve();
      }

    })
  ;
}
