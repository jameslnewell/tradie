import path from 'path';
import fileName from 'file-name';
import webpack from 'webpack';
import deepMerge from '../util/deepMerge';
import getServerBundles from '../util/getServerBundles';
import createApplicationConfig from './util/createAppConfig';
import ignoreStyles from './util/ignoreStyles';
import configureAssets from './util/configureAssets';

export default function createServerConfig(options) {
  const {optimize, src, dest, script: {bundles}, style: {extensions: styleExtensions}, webpack: extraWebpackConfig} = options;

  let config = createApplicationConfig(options);

  //configure the server bundles
  const entries = getServerBundles(bundles).reduce((accum, bundle) => {
    const key = path.join(path.dirname(bundle), fileName(bundle));
    return {
      ...accum,
      [key]: [
        'source-map-support/register', //make error stack traces use source maps for easy debugging
        path.resolve(src, bundle)
      ]
    };

  }, {});

  //replace/ignore (S)CSS on the server - it doesn't get displayed
  //TODO: when we switch to css-modules we won't be able to ignore styles
  ignoreStyles({extensions: styleExtensions}, config);

  //assets
  //TODO: prevent the assets from being emitted on the server
  configureAssets(options, config);

  //merge common and server config
  config = {
    ...config,

    target: 'node',
    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
      setImmediate: false
    },

    //FIXME: source-map-support only works with external maps - there is a PR to work with inline maps
    devtool: optimize ? 'source-map' : 'cheap-module-source-map',

    entry: entries,
    context: src,

    resolve: {
      ...config.resolve,
      alias: {
        'source-map-support\/register': require.resolve('source-map-support/register')
      }
    },

    output: {
      path: dest,
      filename: '[name].js',
      chunkFilename: 'server.[id].js',
      libraryTarget: 'commonjs'
    }

  };

  //merge extra webpack config
  config = deepMerge(config, extraWebpackConfig);

  return config;
}
