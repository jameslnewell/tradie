import through from 'through2';
import UglifyJS from 'uglify-js';

module.exports = function(options) {
  let data = '';

  return through(function(chunk, enc, callback) {
    data += chunk.toString();
    callback();
  },
  function(callback) {
    try {
      const result = UglifyJS.minify(data, {fromString: true, compress: options});
      this.push(result.code); //eslint-disable-line
      return callback();
    } catch (error) {
      this.push(data); //eslint-disable-line
      if (error instanceof UglifyJS.JS_Parse_Error) {
        return callback(new Error(`UglifyJS parse error: ${error.message} at ${error.line}:${error.col}`));
      } else {
        return callback(error);
      }
    }
  });
};
