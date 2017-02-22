import path from 'path';
import webpack from 'webpack';
import deepMerge from '../util/deepMerge';
import createApplicationConfig from './util/createAppConfig';

export default function createVendorConfig(options) {
  const {optimize, src, dest, tmp, script: {vendors}, webpack: extraWebpackConfig} = options;

  let config = createApplicationConfig(options);

  //merge common and test config
  config = {
    ...config,

    target: 'web',
    devtool: optimize ? 'hidden-source-map' : 'cheap-module-eval-source-map',

    entry: {vendor: [].concat(vendors)},
    context: src,

    output: {
      path: dest,
      filename: optimize ? '[name].[chunkhash].js' : '[name].js',
      sourceMapFilename: '[file].map',
      library: '[name]' //FIXME: '[name]_[chunkhash]' in prod
    },

    plugins: [
      ...config.plugins,
      new webpack.DllPlugin({
        path: path.join(tmp, '[name]-manifest.json'),
        name: '[name]' //FIXME: '[name]_[chunkhash]' in prod
      })
    ]

  };

  //merge extra webpack config
  config = deepMerge(config, extraWebpackConfig);

  return config;
}
