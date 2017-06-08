import extensionsToRegex from 'ext-to-regex';

export default function configureAssets(options, webpackConfig) {
  const {asset: {extensions, outputFilename}} = options;

  //configure the asset filename
  let filename = 'files/[hash].[ext]'; //optimize ? '[path][name].[hash].js' :
  // '[path][name].[ext]'
  if (outputFilename) {
    filename = outputFilename;
  }

  webpackConfig.module.rules.push({
    test: extensionsToRegex(extensions),
    use: {
      loader: 'file-loader',
      options: {name: filename}
    }
  });

}
