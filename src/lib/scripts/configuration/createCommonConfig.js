
export default function createCommonConfig(options) {
  const {config: {scripts: {loaders, plugins, extensions}}} = options;
  return {

    resolve: {
      extensions: [''].concat(extensions, '.json')
    },

    module: {

      preLoaders: [],

      //TODO: apply loaders only to project specific code by default, in the future, we'll possibly add a way to override this convention
      loaders: loaders.map(loader => ({
        test: new RegExp(extensions.join('|').replace('.', '\\.') + '$'),
        exclude: /(node_modules)/,
        loader
      })),

      postLoaders: []

    },

    plugins: [].concat(plugins)

  };
}
