'use strict';
const through = require('through2');
const uglify = require('uglify-js');

module.exports = function(options) {
  let data = '';

  return through(
    function(chunk, enc, callback) {
      data += chunk.toString();
      callback();
    },
    function(callback) {
      const result = uglify.minify(data, {fromString: true, compress: options});
      this.push(result.code);
      callback();
    }
  );

};