const defaultConfig = require('./extendDefaultConfig');
const isScriptFile = require('./isScriptFile');

describe('isScriptFile()', () => {

  it('should return true WHEN files are in the src dir AND end with a test script extension', () => {
    const config = defaultConfig();

    expect(isScriptFile('./src/index.js', config)).to.be.true;
    expect(isScriptFile('./src/index.test.js', config)).to.be.true;
    expect(isScriptFile('./src/components/App.js', config)).to.be.true;

  });

  it('should return false WHEN files are not in the src dir', () => {
    const config = defaultConfig();

    expect(isScriptFile('./index.js', config)).to.be.false;
    expect(isScriptFile('./test/components/App.js', config)).to.be.false;

  });

  it('should return false WHEN files do not end with a test script extension', () => {
    const config = defaultConfig();

    expect(isScriptFile('./src/index.scss', config)).to.be.false;
    expect(isScriptFile('./src/index.foobar', config)).to.be.false;

  });

});
