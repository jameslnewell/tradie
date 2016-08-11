import defaultConfig from './util/extendDefaultConfig';
import isTestScriptFile from './isTestScriptFile';

describe('isTestScriptFile()', () => {

  it('should return true WHEN files are in the src dir AND end with a script extension', () => {
    const config = defaultConfig();

    expect(isTestScriptFile('./src/index.test.js', config)).to.be.true;
    expect(isTestScriptFile('./src/components/App.test.js', config)).to.be.true;

  });

  it('should return false WHEN files are not in the src dir', () => {
    const config = defaultConfig();

    expect(isTestScriptFile('./index.test.js', config)).to.be.false;
    expect(isTestScriptFile('./test/components/App.test.js', config)).to.be.false;

  });

  it('should return false WHEN files do not end with a test script extension', () => {
    const config = defaultConfig();

    expect(isTestScriptFile('./src/index.js', config)).to.be.false;
    expect(isTestScriptFile('./src/index.jsx', config)).to.be.false;
    expect(isTestScriptFile('./src/index.scss', config)).to.be.false;
    expect(isTestScriptFile('./src/index.foobar', config)).to.be.false;

  });

});
