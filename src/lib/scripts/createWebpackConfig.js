import path from 'path';
import webpack from 'webpack';

export function configureTarget(options) {
  const target = options.target;
  return {
    target
  };
}

export function configureSourceMaps(tradie) {
  const env = tradie.env;
  return {
    devtool: env === 'production' ? 'hidden-source-map' : 'eval'
  };
}

export function configureResolver(tradie) {
  const extensions = tradie.config.scripts.extensions;
  return {
    resolve: {
      extensions: [''].concat(extensions)
    }
  };
}

export function configureLoaders(tradie) {
  const loaders = tradie.config.scripts.loaders;
  return {
    module: {
      loaders: [
        loaders.map(loader => ({
          exclude: /(node_modules)/, //apply loaders only to project code by default, possibly add a way to specify all the options later
          loader
        }))
      ]
    }
  };
}

export function configurePlugins(tradie) {
  let plugins = tradie.config.scripts.plugins;

  if (tradie.env === 'production') {
    plugins = plugins.concat([
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.optimize.UglifyJsPlugin({output: {comments: false}})
    ]);
    //TODO: create rev-manifest.json
  }

  //TODO: use CommonsChunkPlugin to produce common.js if more than 1 bundle
  //TODO: use ChunkManifestWebpackPlugin to create a vendor.js bundle => can use a DLLReferencePlugin for faster builds?

  return {
    plugins
  };
  //webpack.optimize.CommonsChunkPlugin
}

export function configureEntries(tradie) {
  const env = tradie.env;
  const root = tradie.root;
  const src = tradie.config.scripts.src;
  const dest = tradie.config.scripts.dest;
  const bundles = tradie.config.scripts.bundles;

  return {
    context: path.resolve(path.join(root, src)),
    entry: bundles.reduce((accum, next) => {
      console.log('next', next);
      return {
        ...accum,
        [path.join(
          path.dirname(next),
          path.basename(next, path.extname(next))
        )]: next
      }
    }, {}),
    output: {
      path: path.join(root, dest),
      filename: env === 'production' ? '[name].[hash].js' : '[name].js'
    }
  };
}

export default function(tradie, options) {

  const config = {
    ...configureTarget(options),
    ...configureSourceMaps(tradie),
    ...configureResolver(tradie),
    ...configureLoaders(tradie),
    ...configurePlugins(tradie),
    ...configureEntries(tradie)
  };

  return config;
}
