'use strict';
const through = require('through2');
const uglify = require('uglify-js');

module.exports = function(done) {
  let length = 0;
  return through(
    function(chunk, enc, callback) {
      length += chunk.length;
      this.push(chunk);
      callback();
    },
    function(callback) {
      done(length);
      callback();
    }
  );

};