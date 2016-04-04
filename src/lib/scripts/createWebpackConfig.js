import path from 'path';
import webpack from 'webpack';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import MochaSetupPlugin from './MochaSetupPlugin';
import WatchAndLintPlugin from './WatchAndLintPlugin';

const ENV_PROD = 'production';

function createCommonConfig(options) {
  const {config: {scripts: {loaders, plugins, extensions}}} = options;

  const config = {

    resolve: {
      extensions: [''].concat(extensions)
    },

    module: {

      preLoaders: [],

      //apply loaders only to project specific code by default, in the future, we'll possibly add a way to override this convention
      loaders: loaders.map(loader => ({
        exclude: /(node_modules)/,
        loader
      })),

      postLoaders: []

    },

    plugins: [].concat(plugins)

  };

  return config;
}

function createApplicationConfig(options) {
  const {env} = options;

  const config = createCommonConfig(options);

  //source maps
  config.devtool = env === ENV_PROD ? 'hidden-source-map' : 'eval';

    //plugins
    if (env === ENV_PROD) {

    config.plugins = config.plugins.concat([

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),

      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        output: {comments: false},
        compress: {warnings: false}
      })

    ]);

    //TODO: plugin to create rev-manifest.json to map hashed files to their original names => webpack-manifest-plugin? manifest-revision-webpack-plugin?
  }

  return config;
}

export function createClientConfig(options) {
  const {env, root, config: {src, dest, scripts: {bundles, vendors}}} = options;

  const config = createApplicationConfig(options);

  //configure all the bundles
  const entries = bundles.reduce((accum, bundle) => {

    const dirname = path.dirname(bundle);
    const basename = path.basename(bundle, path.extname(bundle));

    //TODO: check if the bundle starts with './' and warn if it doesn't

    //check for reserved bundle names
    if (basename === 'vendor' || basename === 'common') {
      throw new Error(`'${basename}' is a reserved bundle name. Please use a different name.`);
    }

    //skip the server bundle
    if (basename === 'server') {
      return accum;
    }

    return {
      ...accum,
      [path.join(dirname, basename)]: bundle
    };

  }, {});

  //create a common.js bundle for modules that are shared across multiple bundles
  const entryChunkNames = Object.keys(entries);
  if (entryChunkNames.length > 1) {
    config.plugins = config.plugins.concat([
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: env === ENV_PROD ? '[name].[chunkhash].js' : '[name].js',
        chunks: entryChunkNames, //exclude modules from the vendor chunk
        minChunks: entryChunkNames.length //modules must be used across all the chunks to be included
      })
    ]);
  }//TODO: what about for a single page app where require.ensure is used - I want a common stuff for all chunks in the main entry point

  //create a vendor.js bundle for packages that change infrequently and can be cached for long periods
  if (vendors.length > 0) {

    entries.vendor = vendors;

    //plugins
    if (env === ENV_PROD) {

      //persist module IDs between compilations for long-term caching
      config.recordsPath = 'webpack.records.json';

    }

    //FIXME: for long-term-caching we need to use https://github.com/diurnalist/chunk-manifest-webpack-plugin
    // according to http://webpack.github.io/docs/list-of-plugins.html#2-explicit-vendor-chunk
    //https://github.com/webpack/webpack/issues/1315 and https://github.com/webpack/webpack/issues/90 seems to be the way to do it
    //TODO: use DllPlugin and DllReferencePlugin for faster builds?
    config.plugins = config.plugins.concat([
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'],
        filename: env === ENV_PROD ? '[name].[chunkhash].js' : '[name].js',
        minChunks: Infinity //only modules manually selected for the vendor bundle may be included
      })
    ]);

  }

  return {
    ...config,

    target: 'web',

    entry: entries,
    context: path.resolve(root, src),

    output: {
      path: path.resolve(root, dest),
      filename: env === ENV_PROD ? '[name].[chunkhash].js' : '[name].js'
    }

  };
}

export function createServerConfig(options) {
  const {root, config: {src, dest, scripts: {bundles}}} = options;

  const config = createApplicationConfig(options);

  //configure the server bundles
  const entries = bundles.reduce((accum, bundle) => {

    const dirname = path.dirname(bundle);
    const basename = path.basename(bundle, path.extname(bundle));

    //skip the server bundle
    if (basename !== 'server') {
      return accum;
    }

    return {
      ...accum,
      [path.join(dirname, basename)]: bundle
    };

  }, {});

  return {
    ...config,

    target: 'node',

    entry: entries,
    context: path.resolve(root, src),

    output: {
      path: path.resolve(root, dest),
      filename: '[name].js'
    }

  };
}

export function createTestConfig(options) {
  const {root, config: {src, dest}, mocha: {files, requires}} = options;

  const config = createApplicationConfig(options);

  config.plugins.push(new MochaSetupPlugin());

  return {
    ...config,

    target: 'node',
    devtool: 'inline-source-map',

    entry: {
      tests: [].concat(
        requires, //TODO: check if the bundle starts with './' and warn if it doesn't
        files.map(entry => './' + entry)
      )
    },
    context: path.resolve(root, src),

    output: {
      path: path.resolve(root, dest),
      filename: '[name].js'
    }

  };
}
