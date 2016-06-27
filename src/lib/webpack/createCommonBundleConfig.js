import mapExtensionsToRegExp from './common/mapExtensionsToRegExp';

export default function createCommonBundleConfig(options) {
  const {
    scripts: {extensions: scriptExtensions},
    styles: {extensions: styleExtensions}
  } = options;

  const loaders = []

    //transpile project scripts with the babel loader
    .concat(
      {
        test: mapExtensionsToRegExp(scriptExtensions),
        exclude: /(node_modules)/, //TODO: use include instead to only include files in the src dir
        loader: 'babel'
        //TODO: pass babel config
      }
    )

    //browserify loads JSON files like NodeJS does... emulate that for compatibility
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
