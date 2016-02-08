'use strict';
const fs = require('fs');
const path = require('path');
const uglify = require('../uglify-stream');
const size = require('../size-stream');

/**
 * Create a script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {EventEmitter}  [options.emitter]
 * @param {object}        [options.bundler]
 */
module.exports = function createBundle(options) {

  const debug = options.debug;
  const src = options.src;
  const dest = options.dest;
  const bundler = options.bundler;
  const emitter = options.emitter;

  let args = {src, dest};
  const startTime = Date.now();
  emitter.emit('bundle:start', args);

  //create bundle
  let stream = bundler.bundle();

  //optimise bundle
  if (!debug) {
    stream = stream.pipe(uglify());
  }

  //write bundle
  return stream
    .on('error', error => {
      args.time = Date.now() - startTime;
      args.error = error;
      emitter.emit('bundle:finish', args)
    })
    .pipe(size(size => args.size = size))
    .pipe(fs.createWriteStream(dest))//TODO: handle error
    .on('error', error => {
      args.time = Date.now() - startTime;
      args.error = error;
      emitter.emit('bundle:finish', args)
    })
    .on('finish', () => {
      args.time = Date.now() - startTime;
      emitter.emit('bundle:finish', args)
    })
    ;

};
