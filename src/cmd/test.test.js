import proxyquire from 'proxyquire';
import sinon from 'sinon';
import assert from 'assert';

const sandbox = sinon.sandbox.create();
const mocks = {
  '../lib/scripts/test': {default: sandbox.stub()}
};
const test = proxyquire('./test', mocks);

describe('cmd/test', () => {
  beforeEach(() => {
    sandbox.reset();
  });

  it('should add watch options to yargs', () => {
    const yargs = {option: sandbox.stub()};
    test.hint(yargs);

    const {'0': flag, '1': config} = yargs.option.lastCall.args;
    assert(flag, 'w');
    assert(config, {alias: 'watch', default: false});
  });

  it('should merge test overrides with scripts defaults', () => {
    const args = {args: true};
    const emitter = {emitter: true};
    const config = {
      scripts: {
        externals: ['alpha', 'bravo']
      },
      tests: {
        externals: ['charlie']
      }
    };

    test.exec({args, config, emitter});
    const {
      args: actualArgs,
      emitter: actualEmitter,
      config: actualConfig
    } = mocks['../lib/scripts/test'].default.lastCall.args[0];

    assert.equal(actualArgs, args);
    assert.equal(actualEmitter, emitter);
    assert.deepEqual(actualConfig, {
      externals: ['alpha', 'bravo', 'charlie']
    });
  });
});
