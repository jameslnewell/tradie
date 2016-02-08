'use strict';
const through = require('through2');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

module.exports = function(options) {
  let data = '';

  return through(
    function(chunk, enc, callback) {
      data += chunk.toString();
      callback();
    },
    function(callback) {
      postcss([autoprefixer(options)]).process(data).then(result => {
        result.warnings().forEach(function (warn) {
          console.warn(warn.toString());
        });
        this.push(result.css);
        callback();
      });
    }
  );

};