import through from 'through2';
import clean from 'clean-css';

module.exports = function(options) {
  let data = '';

  return through(
    function(chunk, enc, callback) {
      data += chunk.toString();
      callback();
    },
    function(callback) {
      /* eslint-disable new-cap */
      const cleaner = new clean(options);
      cleaner.minify(data, (err, result) => {
        if (err) return callback(err);
        this.push(result.styles); //eslint-disable-line no-invalid-this
        callback();
      });
    }
  );

};
