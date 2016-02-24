import path from 'path';
import {spawn} from 'child_process';
import glob from 'glob';
import moccacino from 'mocaccino';
import sourceMapper from 'source-mapper';
import createBundler from './createBundler';
import colorStream from '../color-stream';

/**
 * Find all the test files
 * @param   {string}        src
 * @param   {Array<string>} extensions
 * @returns {Promise<Array<string>>}
 */
function findTestFiles(src, extensions) {

  let extension = null;

  if (extensions.length > 1) {
    extension = `{${extensions.join(',')}}`;
  } else {
    extension = extensions.join('');
  }

  return new Promise((resolve, reject) => {
    glob(`**/*.test${extension}`, {cwd: src, realpath: true}, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });

}

/**
 * Bundle and run tests
 * @param   {browserify} bundler
 * @returns {Promise}
 */
function bundleAndRunTests(bundler) {
  return new Promise((resolve, reject) => {

    bundler.bundle((bundleError, buffer) => {
      if (bundleError) return reject(bundleError);

      //run in the same directory as `tradie` so that `mocha` is found
      const node = spawn('node', {cwd: __dirname});

      node.on('error', runError => reject(runError));

      //notify the caller whether the tests where successful
      node.on('exit', code => resolve(code));

      //TODO: error handling of streams
      let stdout = node.stdout;
      let stderr = node.stderr;

      //extract the source map, replace URLs in stack traces from generated bundle with the URLs
      // from the original source files, and pipe the output to the console
      //TODO: remove node_modules/browser-pack
      const result = sourceMapper.extract(buffer.toString());
      const stream1 = sourceMapper.stream(result.map);
      const stream2 = sourceMapper.stream(result.map);
      stdout = stdout.pipe(stream1);
      stderr = stderr.pipe(stream2);

      stdout.pipe(process.stdout);
      stderr.pipe(colorStream()).pipe(process.stderr);

      node.stdin.write(buffer);
      node.stdin.end();

    });

  });
}

/**
 * Bundle and run tests
 * @param   {object} args
 * @param   {object} config
 * @param   {object} emitter
 * @returns {Promise}
 */
export default function({args, config, emitter}) {
  const watch = args.watch;
  const transforms = config.transforms;

  return new Promise((resolve, reject) => {
    findTestFiles(config.src, config.extensions)
      .then(files => {

        if (files.length === 0) {
          return reject(new Error('No script files to test.'));
        }

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

        //bundle
        emitter.emit('scripts.testing.started');
        bundleAndRunTests(bundler)
          .then(
            code => {

              emitter.emit('scripts.testing.finished');

              //if we're not watching then we're done
              if (!watch) {
                resolve(code);
              }

            },
            error => reject(error)
          )
        ;

        if (watch) {

          //re-bundle
          bundler.on('update', () => {
            emitter.emit('scripts.testing.started');
            bundleAndRunTests(bundler)
              .then(
                () => emitter.emit('scripts.testing.finished'),
                error => reject(error)
              )
            ;
          });

          //stop watching and exit on CTL-C
          process.on('SIGINT', () => {
            bundler.close();
            resolve(0);
          });

        }

      })
    ;
  });

}
