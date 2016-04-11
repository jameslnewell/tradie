import through from 'through2';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

module.exports = function(options) {
  let data = '';

  return through(
    function(chunk, enc, callback) {
      data += chunk.toString();
      callback();
    },
    function(callback) {
      postcss([autoprefixer(options)]).process(data).then(result => {
        result.warnings().forEach(warn => {
          console.warn(warn.toString());
        });
        this.push(result.css); //eslint-disable-line no-invalid-this
        callback();
      });
    }
  );

};
