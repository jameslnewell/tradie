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
  //TODO: make glob configurable

  let extension = null;

  if (config.extensions.length > 1) {
    extension = `{${config.extensions.join(',')}}`;
  } else {
    extension = config.extensions.join('');
  }

  console.log('globbing');
  glob(`**/*.test${extension}`, {cwd: src, realpath: true}, function(globError, files) {
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

    const runTests = (bundleError, buffer) => {
      console.log('bundled', bundleError);
      if (bundleError) return emitter.emit('error', bundleError);

      //run in the same dir as `tradie` so that `mocha` is found
      const node = spawn('node', {cwd: __dirname});

      node.on('error', error => emitter.emit('error', error));

      //notify the caller whether the tests where successful
      node.on('exit', code => {
        if (code === 0) {
          emitter.emit('test:finished');
        } else {
          emitter.emit('test:error');
        }
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

    console.log('bundling');
    bundler.bundle(runTests);

    if (watch) {
      bundler.on('update', () => bundler.bundle(runTests));
    }

  });


  return new Promise((resolve) => {
    setTimeout(() => resolve(), 3000);
  });

}
