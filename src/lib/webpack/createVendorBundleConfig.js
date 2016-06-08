import path from 'path';
import webpack from 'webpack';
import createApplicationConfig from './createApplicationConfig';

export default function createVendorConfig(options) {
  const {optimize, src, dest, tmp, scripts: {vendors}} = options;

  const config = createApplicationConfig(options);

  return {
    ...config,

    target: 'web',
    devtool: optimize ? 'hidden-source-map' : 'cheap-module-eval-source-map',

    entry: {vendor: vendors},
    context: src,

    output: {
      path: dest,
      filename: optimize ? '[name].[chunkhash].js' : '[name].js',
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
};
