'use strict';
const path = require('path');
const spawn = require('child_process').spawn;
const glob = require('glob');
const moccacino = require('mocaccino');
const sourceMapper = require('source-mapper');
const createBundle = require('./createBundle');
const createBundler = require('./createBundler');
const colorStream = require('../color-stream');

/**
 * Run tests
 */
module.exports = function(config, options, emitter) {

  const src = config.src;
  const transform = config.transform;

  glob('**/*.test.js', {cwd: src, realpath: true}, function(err, files) {

    const bundler = createBundler({
      debug: true,
      watch: false,
      src: files,
      transform: transform
    });

    moccacino(bundler, {
      node: true,
      reporter: 'spec'
    });

    //bundle the tests using browserify
    bundler.bundle(function(error, buffer) {
      if (error) return emitter.emit('test:error', error);

      const node = spawn('node');

      node.on('error', error => emitter.emit('test:error', error));

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

    });

  });

};
