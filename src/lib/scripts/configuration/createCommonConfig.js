
export default function createCommonConfig(options) {
  const {config: {scripts: {extensions, loaders, plugins, externals}}} = options;

  const allLoaders = []

  //TODO: we only apply loaders to project specific script files, in the future, we'll probably want to provide a way to override this convention e.g. using an object instead of a string
    .concat(
      loaders.map(loader => ({
        test:  new RegExp(extensions.join('$|').replace('.', '\\.') + '$'),
        exclude: /(node_modules)/,
        loader
      }))
    )

    //browserify loads JSON files like NodeJS does... emulate that for compatibility
    //note: last loader is evaluated first http://stackoverflow.com/questions/32234329/what-is-the-loader-order-for-webpack
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

    plugins: [].concat(plugins),

    externals

  };
}
