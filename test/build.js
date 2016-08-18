import path from 'path';
import exec from './util/exec';

describe('tradie build', function() {
  this.timeout(5000);

  it('should exit with 0 when there are no build warnings and no build errors', () => {
    return exec(['build'], {cwd: path.resolve('./test/fixture/build-ok')})
      .then(code => expect(code).to.be.equal(0))
    ;
  });

  //TODO: not sure how to trigger a warning
  // it('should exit with 0 when there are build warnings and no build errors', () => {
  //   return exec(['build'], {cwd: path.resolve('./test/fixture/build-warn')})
  //     .then(code => expect(code).to.be.equal(0))
  //   ;
  // });

  it('should exit with 1 when there are syntax errors', () => {
    return exec(['build'], {cwd: path.resolve('./test/fixture/build-syntax-err')})
      .then(code => expect(code).to.be.equal(1))
    ;
  });

  it('should exit with 1 when there are resolve errors', () => {
    return exec(['build'], {cwd: path.resolve('./test/fixture/build-resolve-err')})
      .then(code => expect(code).to.be.equal(1))
      ;
  });

  describe('a single script and style bundle', () => {

    it('should exit with 0 when the bundles are created', () => {
      return exec(['build'], {cwd: path.resolve('./test/fixture/build-single-bundle')})
        .then(code => {
          expect(file(path.resolve('./test/fixture/build-single-bundle/dist/index.js'))).to.exist;
          expect(file(path.resolve('./test/fixture/build-single-bundle/dist/index.css'))).to.exist;
        })
      ;
    });
  });

  describe('a single script and style bundle AND a vendor bundle', () => {

    it('should exit with 0 when the bundles are created', () => {
      return exec(['build'], {cwd: path.resolve('./test/fixture/build-single-bundle-with-vendor')})
        .then(code => {
          expect(file(path.resolve('./test/fixture/build-single-bundle-with-vendor/dist/vendor.js'))).to.exist;
          expect(file(path.resolve('./test/fixture/build-single-bundle-with-vendor/dist/index.css'))).to.exist;
          expect(file(path.resolve('./test/fixture/build-single-bundle-with-vendor/dist/index.css'))).to.exist;
        })
        ;
    });
  });

});
