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
  glob('**/*.test.js', {cwd: src, realpath: true}, function(err, files) {

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

    const runTests = (error, buffer) => {
      if (error) return emitter.emit('error', error);

      const node = spawn('node'); //TODO: pass all the same env and args so `mocha` is found

      node.on('error', error => emitter.emit('error', error));

      //notify the caller whether the tests where successful
      node.on('exit', code => {
        if (code === 0) {
          emitter.emit('test:finished');
        } else {
          emitter.emit('test:error');
        }
      });

      //extract the source map, replace URLs in stack traces from generated bundle with the URLs
      // from the original source files, and pipe the output to the console
      //TODO: remove node_modules/browser-pack
      const result = sourceMapper.extract(buffer.toString());
      const stream1 = sourceMapper.stream(result.map);
      const stream2 = sourceMapper.stream(result.map);
      node.stdout.pipe(stream1).pipe(process.stdout);
      node.stderr.pipe(stream2).pipe(colorStream()).pipe(process.stderr);
      node.stdin.write(buffer);
      node.stdin.end();

    };

    bundler.on('update', () => bundler.bundle(runTests));

    bundler.bundle(runTests);

  });

}
