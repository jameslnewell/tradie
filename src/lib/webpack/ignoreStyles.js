import webpack from 'webpack';
import mapExtensionsToRegExp from './mapExtensionsToRegExp';

export default function ignoreStyles(options, config) {
  const {extensions} = options;

  config.plugins.push(new webpack.NormalModuleReplacementPlugin(
    mapExtensionsToRegExp(extensions),
    require.resolve('node-noop')
  ));

}
