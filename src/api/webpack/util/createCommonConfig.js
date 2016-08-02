import extensionsToRegex from 'ext-to-regex';

export default function createCommonBundleConfig(options) {
  const {
    src,
    script: {extensions: scriptExtensions},
    style: {extensions: styleExtensions}
  } = options;

  const loaders = []

    //transpile project scripts with the babel loader
    .concat(
      {
        test: extensionsToRegex(scriptExtensions),
        //TODO: pass babel config
        include: src,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true
          //TODO: pass babel config
        }
      }
    )

    //node and browserify loads JSON files like NodeJS does... emulate that for compatibility
    .concat({
      test: /\.json$/,
      loader: 'json-loader'
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