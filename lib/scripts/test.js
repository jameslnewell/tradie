'use strict';
const path = require('path');
const glob = require('glob');
const moccacino = require('mocaccino');
const createBundle = require('./createBundle');
const createBundler = require('./createBundler');



module.exports = function(config, options, emitter) {

  const src = config.src;
  const transform = config.transform;

  glob('**/*.test.js', {cwd: src, realpath: true}, function(err, files) {
    console.log(err, files);

    transform.push(['mocaccino', {node: true}]);

    const bundler = createBundler({
      debug: true,
      watch: false,
      transform: transform
    });

    bundler.bundle(function(err, buffer) {
      console.log(err, buffer.toString());
    });

  });

};
