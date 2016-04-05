import webpack from 'webpack';
import MemoryFS from 'memory-fs';

/**
 * Run webpack
 * @param {object}    config                  The webpack configuration
 * @param {object}    options                 The run options
 * @param {boolean}   [options.watch=false]   Whether we're watching
 * @param {boolean}   [options.virtual=false] Whether to use a virtual file system
 * @param {function}  callback                Called whenever a compilation has finished
 * @returns {Promise<number>}
 */
export default function(config, options, callback) {
  const {watch, virtual} = options;

  return new Promise((resolve, reject) => {

    const compiler = webpack(config);
    let fs;

    if (virtual) {
      fs = new MemoryFS();
      compiler.outputFileSystem = fs;
    }

    const wrappedCallback = (err, stats) => {
      if (err) {
        callback(err, stats, fs);
        if (!watch) reject(err);
      } else {
        const jsonStats = stats.toJson();
        callback(err, jsonStats, fs);
        if (!watch) resolve(jsonStats.errors.length > 0 ? -1 : 0);
      }
    };

    compiler.plugin('bundle-update', (newModules, changedModules, removedModules) => console.log(newModules, changedModules, removedModules));

    if (watch) {

      const watcher = compiler.watch({}, wrappedCallback);

      //stop watching and exit when the user presses CTL-C
      process.on('SIGINT', () => {
        watcher.close(() => resolve(0));
      });

    } else {
      compiler.run(wrappedCallback);
    }

  });

}