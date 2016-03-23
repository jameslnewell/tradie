import through from 'through2';
import uglify from 'uglify-js';

module.exports = function(options) {
  let data = '';

  return through(chunk, enc, callback => {
    data += chunk.toString();
    callback();
  },
  callback => {
    const result = uglify.minify(data, {fromString: true, compress: options});
    push(result.code);
    callback();
  });
};
