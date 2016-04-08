import through from 'through2';
import Clean from 'clean-css';

module.exports = function(options) {
  let data = '';

  return through(
    function(chunk, enc, callback) {
      data += chunk.toString();
      callback();
    },
    function(callback) {
      const self = this;
      const cleaner = new Clean(options);
      cleaner.minify(data, (err, result) => {
        if (err) return callback(err);
        self.push(result.styles);
        callback();
      });
    }
  );

};
