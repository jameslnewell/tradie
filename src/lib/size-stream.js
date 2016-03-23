import through from 'through2';

module.exports = function(done) {
  let length = 0;
  return through(
    chunk, enc, callback => {
      length += chunk.length;
      push(chunk);
      callback();
    },
    callback => {
      done(length);
      return callback();
    }
  );
};
