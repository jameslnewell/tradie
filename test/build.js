import path from 'path';
import exec from './util/exec';

describe('tradie build', function() {
  this.timeout(5000);

  it('should exit with 0 when there are no build warnings and no build errors', () => {
    return exec(['build'], {cwd: path.resolve('./test/fixture/build-ok')})
      .then(code => expect(code).to.be.equal(0))
    ;
  });

  // it('should exit with 0 when there are build warnings and no build errors', () => {
  //   return exec(['build'], {cwd: path.resolve('./test/fixture/build-warn')})
  //     .then(code => expect(code).to.be.equal(0))
  //   ;
  // });

  it('should exit with 1 when there are build errors', () => {
    return exec(['build'], {cwd: path.resolve('./test/fixture/build-err')})
      .then(code => expect(code).to.be.equal(1))
    ;
  });

});
