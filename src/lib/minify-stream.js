import through from 'through2';
import clean from 'clean-css';

module.exports = function(options) {
  let data = '';

  return through(
    chunk, enc, callback => {
      data += chunk.toString();
      callback();
    },
    callback => {
      /* eslint-disable new-cap */
      const cleaner = new clean(options);
      cleaner.minify(data, (err, result) => {
        if (err) return callback(err);
        push(result.styles);
        callback();
      });
    }
  );

};
