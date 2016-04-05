import through from 'through2';

module.exports = function(done) {
  let length = 0;
  return through(
    function(chunk, enc, callback) {
      length += chunk.length;
      this.push(chunk); //eslint-disable-line
      callback();
    },
    function(callback) {
      done(length);
      return callback();
    }
  );
};
