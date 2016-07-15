import webpack from 'webpack';
import mapExtensionsToRegExp from './mapExtensionsToRegExp';

const extensions = [
  '.jpeg', '.jpg', '.gif', '.png', '.svg',
  '.woff', '.ttf', '.eot'
];

export default function ignoreAssets(options, config) {

  config.plugins.push(new webpack.NormalModuleReplacementPlugin(
    mapExtensionsToRegExp(extensions),
    require.resolve('node-noop')
  ));

  //TODO: switch to `ignore-loader`?

}
