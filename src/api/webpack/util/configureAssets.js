import extensionsToRegex from 'ext-to-regex';

const extensions = [
  '.jpeg', '.jpg', '.gif', '.png', '.svg',
  '.woff', '.ttf', '.eot'
];

export default function configureAssets(options, webpack) {

  webpack.module.loaders.push({
    test: extensionsToRegex(extensions),
    loader: 'file-loader'
  });

}
