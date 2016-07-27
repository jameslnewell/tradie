import path from 'path';
import exec from './util/exec';

describe('tradie lint', function() {
  this.timeout(5000);

  it('should exit with 0 when there are no linting errors', () => {
    return exec(['lint'], {cwd: path.resolve('./test/fixture/lint-ok')})
      .then(code => expect(code).to.be.equal(0))
    ;
  });

  it('should exit with 1 when there are linting errors', () => {
    return exec(['lint'], {cwd: path.resolve('./test/fixture/lint-err')})
      .then(code => expect(code).to.be.equal(1))
    ;
  });

});
