import path from 'path';
import webpack from 'webpack';
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

      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.optimize.UglifyJsPlugin({output: {comments: false}})

    ]);

    //TODO: plugin to create rev-manifest.json to map hashed files to their original names
  }

  return config;
}

export function createClientConfig(options) {
  const {env, root, config: {scripts: {src, dest, bundles, vendors}}} = options;

  const config = createApplicationConfig(options);

  //configure all the bundles
  const entries = bundles.reduce((accum, bundle) => {

    const dirname = path.dirname(bundle);
    const basename = path.basename(bundle, path.extname(bundle));

    //TODO: check if the bundle starts with './' and warn if it doesn't

    //check for reserved bundle names
    if (basename === 'vendor' || basename === 'common') {
      throw new Error(`"${basename}" is a reserved bundle name. Please use a different name.`);
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

  //create a vendor.js bundle for packages that change infrequently and can be cached for long periods
  if (vendors.length > 0) {

    entries.vendor = vendors;

    //FIXME: for long-term-caching we need to use https://github.com/diurnalist/chunk-manifest-webpack-plugin
    // according to http://webpack.github.io/docs/list-of-plugins.html#2-explicit-vendor-chunk
    //TODO: move to DllPlugin and DllReferencePlugin for faster builds?
    config.plugins = config.plugins.concat([
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: env === ENV_PROD ? 'vendor.[chunkhash].js' : 'vendor.js',
        minChunks: Infinity //prevent any other packages, other than those specified in the vendor array, from being included
      })
    ]);

  }

  //create a common.js bundle for packages that are shared across multiple bundles
  if (bundles.length > 0) {
    //CommonsChunkPlugin
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
  const {root, config: {scripts: {src, dest, bundles}}} = options;

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
  const {root, config: {scripts: {src, dest}}, mocha: {files, requires}} = options;

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
