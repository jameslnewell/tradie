import path from 'path';
import webpack from 'webpack';
import createApplicationConfig from './createApplicationConfig';
import ignoreStyles from './ignoreStyles';

export default function createServerConfig(options) {
  const {env, root, config: {src, dest, scripts: {bundles}, styles: {extensions: styleExtensions}}} = options;

  const config = createApplicationConfig(options);

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

  return {
    ...config,

    target: 'node',
    devtool: env === 'production' ? 'source-map' : 'cheap-module-source-map', //source-map-support only works with external maps - there is a PR to work with inline maps

    entry: entries,
    context: path.resolve(root, src),

    output: {
      path: path.resolve(root, dest),
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
}
