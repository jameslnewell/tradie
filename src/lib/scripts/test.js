import path from 'path';
import {spawn} from 'child_process';
import glob from 'glob';
import moccacino from 'mocaccino';
import sourceMapper from 'source-mapper';
import createBundle from './createBundle';
import createBundler from './createBundler';
import colorStream from '../color-stream';

/**
 * Run tests
 */
export default function(config, options, emitter) {
  const watch = options.watch;
  const src = config.src;
  const transforms = config.transforms;

  let extension = null;

  if (config.extensions.length > 1) {
    extension = `{${config.extensions.join(',')}}`;
  } else {
    extension = config.extensions.join('');
  }

  return new Promise((resolve, reject) => {

    //TODO: make glob configurable?
    glob(`**/*.test${extension}`, {cwd: src, realpath: true}, (globError, files) => {
      if (globError) return emitter.emit('error', globError);

      const bundler = createBundler({
        debug: true,
        watch,
        src: files,
        transforms
      });

      moccacino(bundler, {
        node: true,
        reporter: 'spec'
      });

      const finishTesting = error => {

        if (watch) {
          bundler.close();
        }

        if (error) {
          emitter.emit('error', bundleError);
          reject(error);
        } else {
          resolve();
        }

      };

      const runTests = (bundleError, buffer) => {
        if (bundleError) return finishTesting(bundleError);

        //run in the same dir as `tradie` so that `mocha` is found
        const node = spawn('node', {cwd: __dirname});

        node.on('error', error => emitter.emit('error', error)); //TODO: emit error, stop watching, reject, then node.disconnect()/.kill()

        //notify the caller whether the tests where successful
        node.on('exit', code => {
          emitter.emit('scripts.testing:finished', {code});
          resolve();//TODO: check if we're watching
        });

        let stdout = node.stdout; //TODO: error handling
        let stderr = node.stderr;

        if (files.length) { //TODO: should we show an error?

          //extract the source map, replace URLs in stack traces from generated bundle with the URLs
          // from the original source files, and pipe the output to the console
          //TODO: remove node_modules/browser-pack
          const result = sourceMapper.extract(buffer.toString()); //FIXME: errors if there are no test files
          const stream1 = sourceMapper.stream(result.map);
          const stream2 = sourceMapper.stream(result.map);
          stdout = stdout.pipe(stream1);
          stderr = stderr.pipe(stream2);

        }

        stdout.pipe(process.stdout);
        stderr.pipe(colorStream()).pipe(process.stderr);

        node.stdin.write(buffer);
        node.stdin.end();

      };

      emitter.emit('scripts.testing:started');
      bundler.bundle(runTests);

      if (watch) {

        //re-bundle
        bundler.on('update', () => {
          emitter.emit('scripts.testing:started');
          bundler.bundle(runTests);
        });

        //TODO: listen for SIGINT and exit

      }

    });

  });

}
