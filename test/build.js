import path from 'path';
import exec from './util/exec';
import createFixture from './util/createFixture';

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
        .then(code => expect(code).to.be.equal(0))
      ;
    });

    it('should create a script and style bundle', () => {
      return exec(['build'], {cwd: path.resolve('./test/fixture/build-single-bundle')})
        .then(() => {
          expect(file(path.resolve('./test/fixture/build-single-bundle/dist/index.js'))).to.exist;
          expect(file(path.resolve('./test/fixture/build-single-bundle/dist/index.css'))).to.exist;
        })
      ;
    });

  });

  describe('a single script and style bundle AND a vendor bundle', () => {
    let fixture;

    beforeEach(() => {
      fixture = createFixture('build-single-bundle-with-vendor');
    });

    afterEach(() => {
      return fixture.clean();
    });

    it('should exit with 0 when the bundles are created', () => {
      return exec(['build'], {cwd: fixture.root()})
        .then(code => expect(code).to.be.equal(0))
      ;
    });

    it('should create a vendor, script and style bundle', () => {
      return exec(['build'], {cwd: fixture.root()})
        .then(() => {
          expect(file(fixture.dest('vendor.js'))).to.exist;
          expect(file(fixture.dest('index.js'))).to.exist;
          expect(file(fixture.dest('index.css'))).to.exist;
        })
        ;
    });

    it('should create a vendor, script and style bundle with the expected hash when built for production', () => {
      return exec(['build', '--optimize'], {cwd: fixture.root()})
        .then(() => {
          expect(file(fixture.dest('rev-manifest.json'))).to.exist;
          expect(file(fixture.dest('vendor.b342f9c09dbb3f5e4851.js'))).to.exist; //FIXME: hashes should be consistent across types of files
          expect(file(fixture.dest('index.6bff2f82c28e4ba1e04d.js'))).to.exist;
          expect(file(fixture.dest('index.ffc15b4006947ca83a6c42e007aba534.css'))).to.exist;
        })
        ;
    });

  });

});
