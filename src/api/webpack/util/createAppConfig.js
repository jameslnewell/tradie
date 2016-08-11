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

      // new webpack.optimize.OccurrenceOrderPlugin(), //no longer needed and is on by defaul  https://gist.github.com/sokra/27b24881210b56bbaff7#occurrence-order
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false
        },
        mangle: {
          screw_ie8: true
        },
        output: {
          comments: false,
          screw_ie8: true
        }
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
