import through from 'through2';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

module.exports = function(options) {
  let data = '';

  return through(
    chunk, enc, callback => {
      data += chunk.toString();
      callback();
    },
    callback => {
      postcss([autoprefixer(options)]).process(data).then(result => {
        result.warnings().forEach(warn => {
          console.warn(warn.toString());
        });
        push(result.css);
        callback();
      });
    }
  );

};
