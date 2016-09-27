import path from 'path';
import exec from './util/exec';

describe('tradie (config)', function() {
  this.timeout(5000);

  it('should exit with 1 when there are MODULE_NOT_FOUND errors inside', () => {
    return exec(['lint'], {cwd: path.resolve('./test/fixture/config-module-not-found-err')})
      .then(code => expect(code).to.be.equal(1))
    ;
  });

});
