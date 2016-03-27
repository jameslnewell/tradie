import webpack from 'webpack';
import MemoryFS from 'memory-fs';

/**
 * Run webpack
 * @param {object}    config                The webpack configuration
 * @param {object}    options               The run options
 * @param {boolean}   options.watch         Whether we're watching
 * @param {boolean}   options.virtual       Whether to use a virtual file system
 * @param {function}  options.afterCompile  Called after a compilation has finished
 */
export default function(config, options) {
  const {watch, virtual, afterCompile} = options;

  return new Promise((resolve, reject) => {

    const compiler = webpack(config);
    let fs;

    if (virtual) {
      fs = new MemoryFS();
      compiler.outputFileSystem = fs;
    }

    const wrappedAfterCompile = (err, stats) => {
      if (err) {
        afterCompile(err, stats, fs);
        if (!watch) reject(err);
      } else {
        const jsonStats = stats.toJson();
        afterCompile(err, jsonStats, fs);
        if (!watch) resolve();
      }
    };

    if (watch) {

      const watcher = compiler.watch({}, wrappedAfterCompile);

      //stop watching and exit when the user presses CTL-C
      process.on('SIGINT', () => {
        watcher.close(() => resolve());
      });

    } else {
      compiler.run(wrappedAfterCompile);
    }

  });

}