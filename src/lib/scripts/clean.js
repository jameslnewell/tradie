'use strict';
const path = require('path');
const del = require('promised-del');

module.exports = function(config, options, emitter) {

  const src = config.src;
  const dest = config.dest;

  emitter.emit('clean:start', {src, dest});
  return del([
    path.join(dest, '*'),
    path.join(dest, '.*')
  ]).then(
    () => emitter.emit('clean:finish', {src, dest}),
    error => emitter.emit('clean:finish', {src, dest, error})
  );

};