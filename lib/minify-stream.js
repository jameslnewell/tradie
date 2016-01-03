'use strict';
const through = require('through2');
const clean = require('clean-css');

module.exports = function(options) {
  let data = '';

  return through(
    function(chunk, enc, callback) {
      data += chunk.toString();
      callback();
    },
    function(callback) {
      const cleaner = new clean(options);
      cleaner.minify(data, (err, result) => {
        if (err) return callback(err);
        this.push(result.styles);
        callback();
      });
    }
  );

};