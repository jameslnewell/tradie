import proxyquire from 'proxyquire';
import sinon from 'sinon';
import assert from 'assert';
import path from 'path';

import scriptsDefaults from './scripts/defaults';
import testsDefaults from './tests/defaults';
import stylesDefaults from './styles/defaults';

const sandbox = sinon.sandbox.create();
const mocks = {
  'fs': {
    existsSync: sandbox.stub().returns(true),
    readFileSync: sandbox.stub()
  }
};
const readConfig = proxyquire('./readConfig', mocks).default;

describe('getConfig()', () => {
  function mockTradierc(config) {
    mocks.fs.readFileSync.returns(JSON.stringify(config));
  }

  beforeEach(() => {
    sandbox.reset();
    mockTradierc({});
  });

  it('should load the config from .tradierc', () => {
    readConfig();
    const requestedTradiercPath = mocks.fs.readFileSync.lastCall.args[0];

    assert.equal(requestedTradiercPath, path.join(process.cwd(), `.tradierc`),
      'Did not look for .tradierc in appropriate location');
  });

  it('should load defaults on empty config', () => {
    const config = readConfig();

    assert.deepEqual(config.scripts, scriptsDefaults);
    assert.deepEqual(config.tests, testsDefaults);
    assert.deepEqual(config.styles, stylesDefaults);
    assert.deepEqual(config.plugins, []);
  });

  it('should apply user overrides', () => {
    mockTradierc({
      scripts: {src: './src/js'},
      tests: {externals: ['react']},
      styles: {bundles: ['base.scss', 'main.scss']},
      plugins: ['funify', 'cakeify']
    });
    const config = readConfig();

    assert.deepEqual(config.scripts.src, './src/js');
    assert.deepEqual(config.tests.externals, ['react']);
    assert.deepEqual(config.styles.bundles, ['base.scss', 'main.scss']);
    assert.deepEqual(config.plugins, ['funify', 'cakeify']);
  });

  it('should merge env-specific user overrides', () => {
    mockTradierc({
      styles: {bundles: ['base.scss', 'main.scss']},
      plugins: ['funify', 'cakeify'],
      env: {
        production: {
          styles: {bundles: ['prod.scss']},
          plugins: ['prodify']
        }
      }
    });
    const config = readConfig('production');

    assert.deepEqual(config.styles.bundles, ['base.scss', 'main.scss', 'prod.scss']);
    assert.deepEqual(config.plugins, ['funify', 'cakeify', 'prodify']);
  });
});
