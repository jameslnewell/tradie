import mapExtensionsToRegExp from './mapExtensionsToRegExp';

const extensions = [
  '.jpeg', '.jpg', '.gif', '.png', '.svg',
  '.woff', '.ttf', '.eot'
];

export default function configureAssets(options, webpack) {

  webpack.module.loaders.push({
    test: mapExtensionsToRegExp(extensions),
    loader: 'file-loader'
  });

}
