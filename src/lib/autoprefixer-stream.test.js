import assert from 'assert';
import through2 from 'through2';
import target from './autoprefixer-stream';


describe('autoprefixer-stream', () => {

  it('should prefix an incoming stream with the relevant browser types', (done) => {
    let actual = '';
    // create our targeted stream
    const outputStream = target({browsers: 'last 2 versions'});
    outputStream.pipe(through2((chunk, enc, callback) => {
      actual = chunk.toString();
      callback();
    }, () => {
      assert.equal(actual, 'body {\n display:-ms-flexbox;\n display:flex;\n}');
      done();
    }));
    outputStream.write('body {\n display:flex;\n}');
    outputStream.end();
  });

});
