import mapExtensionsToRegExp from './common/mapExtensionsToRegExp';

export default function createCommonBundleConfig(options) {
  const {
    src,
    scripts: {extensions: scriptExtensions},
    styles: {extensions: styleExtensions}
  } = options;

  const loaders = []

    //transpile project scripts with the babel loader
    .concat(
      {
        test: mapExtensionsToRegExp(scriptExtensions),
        include: src,
        loader: 'babel',
        query: {
          cacheDirectory: true
          //TODO: pass babel config
        }
      }
    )

    //node and browserify loads JSON files like NodeJS does... emulate that for compatibility
    .concat({
      test: /\.json$/,
      loader: 'json'
    })

  ;

  //TODO: enable/disable optimize/minimize
  //new webpack.LoaderOptionsPlugin({
  //  minimize: true,
  //  debug: false
  //})

  return {

    entry: {},

    resolve: {
      extensions: [''].concat(scriptExtensions, '.json', styleExtensions)
    },

    module: {

      preLoaders: [],
      loaders: loaders,
      postLoaders: []

    },

    plugins: []

  };
}
