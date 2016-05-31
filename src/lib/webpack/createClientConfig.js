import path from 'path';
import fileName from 'file-name';
import webpack from 'webpack';
import ManifestPlugin from 'webpack-manifest-plugin';
import getClientBundles from './common/getClientBundles';
import createApplicationConfig from './createApplicationConfig';

import configureStyleLoader from './client/configureStyleLoader';
import configureAssets from './client/configureAssets';

const assetExtensions = [
  '.jpeg', '.jpg', '.gif', '.png', '.svg',
  '.woff', '.ttf', '.eot'
];

export default function createClientConfig(options) {
  const {
    env,
    root,
    config: {
      src, dest, tmp,
      bundles, vendors,
      style: {extensions: styleExtensions}
    }
  } = options;

  const minimize = env === 'production';
  const config = createApplicationConfig(options);

  //configure all the bundles
  const clientBundles = getClientBundles(bundles);
  config.entry = clientBundles.reduce((accum, bundle) => {
    const dirname = path.dirname(bundle);
    const basename = fileName(bundle);
    return {
      ...accum,
      [path.join(dirname, basename)]: bundle
    };
  }, {});

  //create a common.js bundle for modules that are shared across multiple bundles
  if (clientBundles.length > 1) {
    config.plugins = config.plugins.concat([
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: minimize ? '[name].[chunkhash].js' : '[name].js',
        chunks: clientBundles, //exclude modules from the vendor chunk
        minChunks: clientBundles.length //modules must be used across all the chunks to be included
      })
    ]);
  }//TODO: what about for a single page app where require.ensure is used - I want a common stuff for all chunks in the main entry point

  //use vendor modules from the vendor bundle
  if (vendors.length > 0) {
    //chose DLLPlugin for long-term-caching based on https://github.com/webpack/webpack/issues/1315
    config.plugins = config.plugins.concat([
      new webpack.DllReferencePlugin({
        context: dest,
        manifest: require(path.join(tmp, 'vendor-manifest.json'))
      })
    ]);
  }

  //stylesheets
  configureStyleLoader({
    minimize, root, src, extensions: styleExtensions
  }, config);

  //assets
  configureAssets({
    minimize, extensions: assetExtensions
  }, config);

  //revision-manifest //TODO: include vendor.js
  if (env === 'production') {
    config.plugins.push(new ManifestPlugin({
      fileName: 'rev-manifest.json'
    }));
  }

  return {
    ...config,

    target: 'web',
    devtool: minimize ? 'hidden-source-map' : 'cheap-module-eval-source-map',

    context: src,

    output: {
      path: dest,
      filename: minimize ? '[name].[chunkhash].js' : '[name].js'
    }

  };
}
