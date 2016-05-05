import path from 'path';
import webpack from 'webpack';
import createApplicationConfig from './createApplicationConfig';

export default function createVendorConfig(options) {
  const {env, root, config: {src, dest, scripts: {vendors}}} = options;

  const config = createApplicationConfig(options);

  return {
    ...config,

    target: 'web',
    devtool: env === 'production' ? 'hidden-source-map' : 'cheap-module-eval-source-map',

    entry: {vendor: vendors},
    context: path.resolve(root, src),

    output: {
      path: path.resolve(root, dest),
      filename: env === 'production' ? '[name].[chunkhash].js' : '[name].js',
      library: '[name]' //FIXME: '[name]_[chunkhash]' in prod
    },

    plugins: [
      ...config.plugins,
      new webpack.DllPlugin({
        path: path.join(root, dest, '[name]-manifest.json'),
        name: '[name]' //FIXME: '[name]_[chunkhash]' in prod
      })
    ]

  };
}
