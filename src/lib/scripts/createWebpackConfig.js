import path from 'path';
import webpack from 'webpack';
import WatchAndLintPlugin from './WatchAndLintPlugin';

function configureSourceMaps(env) {
  return {
    devtool: env === 'production' ? 'hidden-source-map' : 'eval'
  };
}

function configureResolver(extensions) {
  return {
    resolve: {
      extensions: [''].concat(extensions)
    }
  };
}

function configureLoaders(loaders) {
  return {
    module: {
      //preLoaders: [
      //  {
      //    //test: /\.jsx?$/, //TODO: only apply to script extensions
      //    exclude: /(node_modules)/,
      //    loader: 'eslint' //TODO: only lint in dev and if "build"ing
      //  }
      //],
      loaders: loaders.map(loader => ({
        exclude: /(node_modules)/, //apply loaders only to project code by default, possibly add a way to specify all the options later
        loader
      }))
    }
  };
}

function configurePlugins(env, vendor, plugins, onChange) {
  let allPlugins = [];

  if (onChange) {
    allPlugins.push(new WatchAndLintPlugin(onChange));
  }

  // --- vendor bundle ---

  //create a vendor bundle
  if (vendor.length > 0) {
    //FIXME: for long-term-caching we need to use https://github.com/diurnalist/chunk-manifest-webpack-plugin
    // according to http://webpack.github.io/docs/list-of-plugins.html#2-explicit-vendor-chunk
    //TODO: move to DllPlugin and DllReferencePlugin for faster builds
    allPlugins = allPlugins.concat([
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: env === 'production' ? 'vendor.[hash].js' : 'vendor.js',
        //prevent any other packages, other than those specified in the vendor array, from being included
        minChunks: Infinity
      })
    ]);
  }

  // --- common bundle ---

  //TODO: use CommonsChunkPlugin to produce common.js if there is more than 1 bundle

  // --- production ---

  if (env === 'production') {
    allPlugins = allPlugins.concat([
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.optimize.UglifyJsPlugin({output: {comments: false}})
    ]);
    //TODO: create rev-manifest.json to map hashed files to their original names
  }

  // --- user plugins ---

  allPlugins = allPlugins.concat(plugins);

  return {plugins: allPlugins};
}

function configureEntries(env, root, src, dest, bundles, vendor) {

  //TODO: error if bundle name contains "vendor.js" or "common.js"

  const entries = bundles.reduce((accum, bundle) => ({
    ...accum,
    [path.join(
      path.dirname(bundle),
      path.basename(bundle, path.extname(bundle))
    )]: bundle
  }), {});

  if (vendor.length > 0) {
    entries.vendor = vendor;
  }

  return {

    context: path.resolve(path.join(root, src)),

    entry: entries,

    output: {
      path: path.join(root, dest),
      filename: env === 'production' ? '[name].[hash].js' : '[name].js'
    }

  };
}

/**
 * Create a webpack config object for all the client-side scripts
 * @param   {object} options
 * @param   {string} options.env
 * @param   {string} options.root
 * @param   {object} options.args
 * @param   {object} options.config
 * @returns {object}
 */
export function createClientConfig(options) {

  const {env, root} = options;
  const {src, dest, bundles, vendor, loaders, plugins, extensions} = options.config.scripts;

  return {
    target: 'web',
    ...configureSourceMaps(env),
    ...configureResolver(extensions),
    ...configureLoaders(loaders),
    ...configurePlugins(env, vendor, plugins),
    ...configureEntries(env, root, src, dest, bundles.filter(
      bundle => path.basename(bundle, path.extname(bundle)) !== 'server' //exclude **/server.js bundles
    ), vendor)
  };

}

/**
 * Create a webpack config object for all the server-side scripts
 * @param   {object} options
 * @param   {string} options.env
 * @param   {string} options.root
 * @param   {object} options.args
 * @param   {object} options.config
 * @returns {object}
 */
export function createServerConfig(options) {

  const {env, root} = options;
  const {src, dest, bundles, loaders, plugins, extensions} = options.config.scripts;

  return {
    target: 'node',
    ...configureSourceMaps(env),
    ...configureResolver(extensions),
    ...configureLoaders(loaders),
    ...configurePlugins(env, [], plugins),
    ...configureEntries(
      env, root, src, dest, bundles.filter(
        bundle => path.basename(bundle, path.extname(bundle)) === 'server' //only include **/server.js bundles
      ), []
    )
  };

}

/**
 * Create a webpack config object for all the server-side scripts
 * @param   {object}  options
 * @param   {string}  options.env
 * @param   {string}  options.root
 * @param   {object}  options.args
 * @param   {array}   options.files
 * @param   {array}   options.requires
 * @returns {object}
 */
export function createTestConfig(options) {

  const {env, root} = options;
  const {src, dest, loaders, plugins, extensions} = options.config.scripts;

  const config = {

    target: 'node',
    devtool: 'inline-source-map',

    context: path.resolve(src, root),

    entry: {
      test: [].concat(files, requires)
    },

    output: {
      path: path.resolve(dest, root),
      filename: '[name].js'
    },

    ...configureResolver(extensions),
    ...configureLoaders(loaders),
    ...configurePlugins(null, [], plugins.concat(new MochaSetupPlugin())) //TODO: evaluate RewirePlugin

  };
  return config;
}

