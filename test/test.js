import path from 'path';
import exec from './util/exec';

describe('tradie test', function() {
  this.timeout(5000);

  it('should exit with 0 when there are no test errors or failures', () => {
    return exec(['test'], {cwd: path.resolve('./test/fixture/test-ok')})
      .then(code => expect(code).to.be.equal(0))
    ;
  });

  it('should exit with 1 when there are test errors', () => {
    return exec(['test'], {cwd: path.resolve('./test/fixture/test-err')})
      .then(code => expect(code).to.be.equal(1))
    ;
  });

  it('should exit with 1 when there are test failures', () => {
    return exec(['test'], {cwd: path.resolve('./test/fixture/test-fail')})
      .then(code => expect(code).to.be.equal(1))
    ;
  });

});
