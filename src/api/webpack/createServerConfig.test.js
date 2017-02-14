import createServerBundleConfig from './createServerConfig';
import extendDefaultConfig from '../util/extendDefaultConfig';

describe('createServerBundleConfig()', () => {

  it('should merge extra webpack config', () => {

    const config = createServerBundleConfig(extendDefaultConfig({

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
