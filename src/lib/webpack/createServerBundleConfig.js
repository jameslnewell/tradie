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
      [path.join(dirname, basename)]: bundle
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
    devtool: optimize ? 'source-map' : 'cheap-module-source-map', //source-map-support only works with external maps - there is a PR to work with inline maps

    entry: entries,
    context: src,

    output: {
      path: dest,
      filename: '[name].js',
      libraryTarget: 'commonjs'
    },

    plugins: [
      ...config.plugins,

      //make error traces use source maps
      new webpack.BannerPlugin(
        'require(\'source-map-support\').install();',
        {raw: true, entryOnly: true}
      )

    ]

  };

  //merge extra webpack config
  config = deepMerge(config, extraWebpackConfig);

  return config;
}
