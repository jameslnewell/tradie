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

    let fs = null;
    const compiler = webpack(config);

    if (virtual) {
      fs = new MemoryFS();
      compiler.outputFileSystem = fs;
    }

    const wrappedCallback = (err, stats) => {
      if (err) return reject(err);

      callback(stats, fs); //eslint-disable-line callback-return

      if (!watch) {
        resolve();
      }

    };

    if (watch) {

      const watcher = compiler.watch({}, wrappedCallback);

      //stop watching and exit when the user presses CTL-C
      process.on('SIGINT', () => {
        watcher.close(() => resolve());
      });

    } else {
      compiler.run(wrappedCallback);
    }

  });

}
