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
    let fs = null;

    if (virtual) {
      fs = new MemoryFS();
      compiler.outputFileSystem = fs;
    }

    const wrappedCallback = (err, stats) => {
      if (err) {
        callback(err, stats, fs); //eslint-disable-line callback-return
        if (!watch) reject(err);
      } else {
        const jsonStats = stats.toJson();
        callback(err, jsonStats, fs); //eslint-disable-line callback-return
        if (!watch) resolve(jsonStats.errors.length > 0 ? -1 : 0);
      }
    };

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
