import path from 'path';
import webpack from 'webpack';
import extensionsToRegex from 'ext-to-regex';
import ResolveShortPathPlugin from 'webpack-resolve-short-path-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

export default function createCommonBundleConfig(options) {
  const {
    optimize,
    src,
    tmp,
    script: {extensions: scriptExtensions},
    babel
  } = options;

  const loaders = [];

  //transpile project scripts with the babel loader
  if (Object.keys(babel).length) {
    loaders.push(
      {
        test: extensionsToRegex(scriptExtensions),
        //TODO: pass babel config
        include: src,
        use: [{
          loader: 'babel-loader',
          options: {
            ...babel,
            babelrc: false,
            cacheDirectory: tmp
          }
        }]
      }
    );
  }

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
      modules: [src, 'node_modules'],
      extensions: [].concat(scriptExtensions, '.json'),
      plugins: [
        new ResolveShortPathPlugin({rootPath: src})
      ]
    },

    module: {
      rules: loaders
    },

    plugins: plugins

  };
}
