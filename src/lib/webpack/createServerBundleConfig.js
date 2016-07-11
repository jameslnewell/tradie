import path from 'path';
import webpack from 'webpack';

import createApplicationConfig from './createApplicationConfig';
import ignoreStyles from './ignoreStyles';
import deepMerge from '../util/deepMerge';
import configureAssets from './configureAssets';

export default function createServerConfig(options) {
  const {optimize, src, dest, scripts: {bundles}, styles: {extensions: styleExtensions}, webpack: extraWebpackConfig} = options;

  let config = createApplicationConfig(options);

  //configure the server bundles
  const entries = bundles.reduce((accum, bundle) => {

    const dirname = path.dirname(bundle);
    const basename = path.basename(bundle, path.extname(bundle));

    //skip the server bundle
    if (basename !== 'server') {
      return accum;
    }

    return {
      ...accum,
      [path.join(dirname, basename)]: [
        'source-map-support/register', //make error stack traces use source maps for easy debugging
        bundle
      ]
    };

  }, {});

  //replace/ignore (S)CSS on the server - it doesn't get displayed
  ignoreStyles({extensions: styleExtensions}, config);

  //assets
  configureAssets({optimize}, config);

  //merge common and server config
  config = {
    ...config,

    target: 'node',
    node: {
      __dirname: false,
      __filename: false
    },

    //FIXME: source-map-support only works with external maps - there is a PR to work with inline maps
    devtool: optimize ? 'source-map' : 'cheap-module-source-map',

    entry: entries,
    context: src,

    output: {
      path: dest,
      filename: '[name].js',
      libraryTarget: 'commonjs'
    }

  };

  //merge extra webpack config
  config = deepMerge(config, extraWebpackConfig);

  return config;
}
