import through from 'through2';
import uglify from 'uglify-js';

module.exports = function(options) {
  let data = '';

  return through(function(chunk, enc, callback) {
    data += chunk.toString();
    callback();
  },
  function(callback) {
    const result = uglify.minify(data, {fromString: true, compress: options});
    this.push(result.code); //eslint-disable-line
    callback();
  });
};
