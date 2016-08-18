import path from 'path';
import webpack from 'webpack';
import extensionsToRegex from 'ext-to-regex';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

export default function createCommonBundleConfig(options) {
  const {
    optimize,
    src,
    tmp,
    script: {extensions: scriptExtensions},
    babel
  } = options;

  const loaders = []

  //transpile project scripts with the babel loader
  console.log('BABEL OPTIONS', Object.keys(babel));
  if (Object.keys(babel).length) {
    loaders.push(
      {
        test: extensionsToRegex(scriptExtensions),
        //TODO: pass babel config
        include: src,
        loader: 'babel-loader',
        query: {
          ...babel,
          babelrc: false,
          cacheDirectory: tmp
        }
      }
    );
  }

  //node and browserify loads JSON files like NodeJS does... emulate that for compatibility
  loaders.push({
    test: /\.json$/,
    loader: 'json-loader'
  });

  const plugins = [

    //enforce case sensitive paths to avoid issues between file systems
    new CaseSensitivePathsPlugin(),

    new webpack.LoaderOptionsPlugin({
      minimize: optimize,
      debug: !optimize
    })

  ];

  //TODO: look for loaders in tradie's and user's node_modules
  //config.resolveLoader = {root: [
  // path.join(__dirname, "node_modules")
  //]});

  return {

    entry: {},

    resolve: {
      extensions: [''].concat(scriptExtensions, '.json')
    },

    module: {

      preLoaders: [],
      loaders: loaders,
      postLoaders: []

    },

    plugins: plugins

  };
}
