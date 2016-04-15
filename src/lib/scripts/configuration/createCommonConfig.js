
export default function createCommonConfig(options) {
  const {config: {scripts: {loaders, plugins, extensions}}} = options;

  const allLoaders = []

  //TODO: we only apply loaders to project specific code, in the future, we'll probably want to provide a way to override this convention e.g. string vs object
    .concat(
      loaders.map(loader => ({
        exclude: /(node_modules)/,
        loader
      }))
    )

    //browserify loads JSON files like NodeJS does... emulate that for compatibility
    .concat({
      test: /\.json$/,
      loader: 'json'
    })

  ;

  return {

    resolve: {
      extensions: [''].concat(extensions, '.json')
    },

    module: {

      preLoaders: [],
      loaders: allLoaders,
      postLoaders: []

    },

    plugins: [].concat(plugins)

  };
}
