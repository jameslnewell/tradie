import mapExtensionsToRegExp from './../common/mapExtensionsToRegExp';

export default function configureAssets(options, webpack) {
  const {minimize, extensions} = options;

  webpack.module.loaders.push({
    test: mapExtensionsToRegExp(extensions),
    loader: 'file-loader'
  });

}
