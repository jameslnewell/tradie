import getObjectValues from 'object-values';
import webpack from 'webpack';
import BundleUpdatePlugin from 'webpack-bundle-update-hook-plugin';
import createCommonBundleConfig from './createCommonConfig';

class BundleUpdatedPlugin {

  constructor(callback) {
    this.callback = callback;
  }

  apply(compiler) {
    compiler.plugin('bundle-update', (newModules, changedModules, removedModules) => {
      this.callback(getObjectValues(newModules), getObjectValues(changedModules), getObjectValues(removedModules));
    });
  }

}

export default function createApplicationConfig(options) {
  const {watch, optimize, onFileChange} = options;

  const config = createCommonBundleConfig(options);

  //plugins
  if (optimize) {

    config.plugins = config.plugins.concat([

      //set env so non-prod code can be removed by uglify-js
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

  }

  //emit bundle update events
  if (watch) {
    config.plugins = config.plugins.concat([
      new BundleUpdatePlugin(),
      new BundleUpdatedPlugin(onFileChange)
    ]);
  }

  return config;
}
