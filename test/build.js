import path from 'path';
import exec from './util/exec';
import createFixture from './util/createFixture';

describe('tradie build', function() {
  this.timeout(5000);

  let fixture;

  afterEach(() => {
    if (fixture) {
      return fixture.clean();
    }
  });

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

  describe('create a single script and style bundle', () => {

    beforeEach(() => {
      fixture = createFixture('build-single-bundle-ok');
    });

    it('should exit with 0 when the bundles are created', () => {
      return exec(['build'], {cwd: fixture.root()})
        .then(code => expect(code).to.be.equal(0))
      ;
    });

    it('should create a script and style bundle', () => {
      return exec(['build'], {cwd: fixture.root()})
        .then(() => {
          expect(file(fixture.dest('index.js'))).to.exist;
          expect(file(fixture.dest('index.css'))).to.exist;
        })
      ;
    });


    it('should create a script and style bundle with the expected hash when built for production', () => {
      return exec(['build', '--optimize'], {cwd: fixture.root()})
        .then(() => {
          expect(file(fixture.dest('rev-manifest.json'))).to.exist;
          expect(file(fixture.dest('index.66813078a81aaa58f29a.js'))).to.exist; //FIXME: hashes should be consistent across the different types of files
          expect(file(fixture.dest('index.ffc15b4006947ca83a6c42e007aba534.css'))).to.exist;
        })
        ;
    });

  });

  describe('create a single vendor, script and style bundle', () => {

    beforeEach(() => {
      fixture = createFixture('build-single-bundle-with-vendor-ok');
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
          expect(file(fixture.dest('vendor.b342f9c09dbb3f5e4851.js'))).to.exist; //FIXME: hashes should be consistent across the different types of files
          expect(file(fixture.dest('index.66813078a81aaa58f29a.js'))).to.exist;
          expect(file(fixture.dest('index.ffc15b4006947ca83a6c42e007aba534.css'))).to.exist;
        })
        ;
    });

  });

  describe('extract assets from script and style files', () => {

    beforeEach(() => {
      fixture = createFixture('build-assets-ok');
    });

    it('should exit with 0 when the bundles are created', () => {
      return exec(['build'], {cwd: fixture.root()})
        .then(code => expect(code).to.be.equal(0))
        ;
    });

    it('should create the assets', () => {
      return exec(['build'], {cwd: fixture.root()})
        .then(() => {
          expect(file(fixture.dest('files/a55c935a7e0ac63269b2187fe7cd6ce6.jpg'))).to.exist;
          expect(file(fixture.dest('files/bccb8b559921cd4bdf6a8d85881e5f7c.jpg'))).to.exist;
        })
        ;
    });

  });

});
