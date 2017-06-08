import createClientBundleConfig from './createClientConfig';
import extendDefaultConfig from '../util/extendDefaultConfig';

describe('createClientConfig()', () => {

  it('should merge extra webpack config', () => {

    const config = createClientBundleConfig(extendDefaultConfig({

      watch: false, optimize: false,

      webpack: {

        module: {
          rules: [
            {
              test: /\.foobar$/,
              use: {loader: 'foobar'}
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

    expect(config).to.have.property('module').to.have.property('rules');
    expect(config.module.rules).to.contain({
      test: /\.foobar$/,
      use: {loader: 'foobar'}
    });

    expect(config).to.have.property('externals');
    expect(config.externals).to.have.property('react/addons', true);
    expect(config.externals).to.have.property('react/lib/ExecutionEnvironment', true);
    expect(config.externals).to.have.property('react/lib/ReactContext', true);

  });

});
