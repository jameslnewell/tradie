import createTestBundleConfig from './createTestConfig';
import extendDefaultConfig from '../util/extendDefaultConfig';

describe('createTestBundleConfig()', () => {

  it('should merge extra webpack config', () => {

    const config = createTestBundleConfig(extendDefaultConfig({

      watch: false, optimize: false,

      webpack: {

        module: {
          loaders: [
            {
              test: /\.foobar$/,
              use: 'foobar'
            }
          ]
        },

        externals: {
          'react/addons': true,
          'react/lib/ExecutionEnvironment': true,
          'react/lib/ReactContext': true
        }

      }

    }));

    expect(config).to.have.property('module').to.have.property('loaders');
    expect(config.module.rules).to.contain({
      test: /\.foobar$/,
      use: 'foobar'
    });

    expect(config).to.have.property('externals');
    expect(config.externals).to.have.property('react/addons', true);
    expect(config.externals).to.have.property('react/lib/ExecutionEnvironment', true);
    expect(config.externals).to.have.property('react/lib/ReactContext', true);

  });

});
