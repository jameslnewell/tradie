import createClientBundleConfig from './createClientConfig';
import extendDefaultConfig from '../util/extendDefaultConfig';

describe('createClientBundleConfig()', () => {

  it('should merge extra webpack config', () => {

    const config = createClientBundleConfig(extendDefaultConfig({

      watch: false, optimize: false,

      webpack: {

        module: {
          loaders: [
            {
              test: /\.foobar$/,
              loader: 'foobar'
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
    expect(config.module.loaders).to.contain({
      test: /\.foobar$/,
      loader: 'foobar'
    });

    expect(config).to.have.property('externals');
    expect(config.externals).to.have.property('react/addons', true);
    expect(config.externals).to.have.property('react/lib/ExecutionEnvironment', true);
    expect(config.externals).to.have.property('react/lib/ReactContext', true);

  });

});
