import path from 'path';
import fileName from 'file-name';
import webpack from 'webpack';
import resolve from 'resolve';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import getClientBundles from './getClientBundles';
import createApplicationConfig from './createApplicationConfig';
import mapExtensionsToRegExp from './mapExtensionsToRegExp';


export default function createClientConfig(options) {
  const {env, root, config: {src, dest, scripts: {bundles, vendors}, styles: {extensions}}} = options;

  const config = createApplicationConfig(options);

  //configure all the bundles
  const clientBundles = getClientBundles(bundles);
  const entries = clientBundles.reduce((accum, bundle) => {
    const dirname = path.dirname(bundle);
    const basename = fileName(bundle);
    return {
      ...accum,
      [path.join(dirname, basename)]: bundle
    };
  }, {});

  //create a common.js bundle for modules that are shared across multiple bundles
  if (clientBundles.length > 1) {
    config.plugins = config.plugins.concat([
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: env === 'production' ? '[name].[chunkhash].js' : '[name].js',
        chunks: clientBundles, //exclude modules from the vendor chunk
        minChunks: clientBundles.length //modules must be used across all the chunks to be included
      })
    ]);
  }//TODO: what about for a single page app where require.ensure is used - I want a common stuff for all chunks in the main entry point

  //use vendor modules from the vendor bundle
  if (vendors.length > 0) {
    //chose DLLPlugin for long-term-caching based on https://github.com/webpack/webpack/issues/1315
    config.plugins = config.plugins.concat([
      new webpack.DllReferencePlugin({
        context: path.resolve(root, dest),
        manifest: require(path.resolve(root, dest, 'vendor-manifest.json'))
      })
    ]);
  }

  //stylesheets
  config.sassLoader = {
    importer: function(url, prev, done) {
      prev = prev === 'stdin' ? process.cwd()+'/.' : prev; //FIXME: pending https://github.com/jtangelder/sass-loader/issues/234
      resolve(url, {

        basedir: path.dirname(prev),

        //look for SASS and CSS files
        extensions: ['.scss', '.sass', '.css'],

        //allow packages to define a SASS entry file using the "main.scss", "main.sass" or "main.css" keys
        packageFilter(pkg) {
          pkg.main = pkg['main.scss'] || pkg['main.sass'] || pkg['main.css'] || pkg['style'];
          return pkg;
        }

      }, (err, file) => {
        if (err) {
          return done(err);
        } else {
          return done({file});
        }
      });
    }
  };
  config.module.loaders = config.module.loaders.concat([
    {
      test: mapExtensionsToRegExp(extensions),
      loader: ExtractTextPlugin.extract('style-loader', ['css?sourceMap', 'postcss?sourceMap', 'resolve-url?sourceMap', 'sass?sourceMap'])
    }
  ]);
  config.plugins = config.plugins.concat([
    new ExtractTextPlugin(env === 'production' ? '[name].[contenthash].css' : '[name].css', {allChunks: true})
  ]);
  config.postcss = [autoprefixer({browsers: ['last 2 versions']})];//NOTE: css-loader looks for NODE_ENV=production and performs cssnano

  //assets
  config.module.loaders = config.module.loaders.concat([
    {
      test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$/,
      loader: 'file'
    }
  ]);

  //manifest
  console.log('PLUGIN', env === 'production');
  if (env === 'production') {
    config.plugins.push(new ManifestPlugin({
      fileName: 'fingerprint-manifest.json'
    }));
  }



  return {
    ...config,

    target: 'web',
    devtool: env === 'production' ? 'hidden-source-map' : 'cheap-module-eval-source-map',

    entry: entries,
    context: path.resolve(root, src),

    output: {
      path: path.resolve(root, dest),
      filename: env === 'production' ? '[name].[chunkhash].js' : '[name].js'
    }

  };
}
