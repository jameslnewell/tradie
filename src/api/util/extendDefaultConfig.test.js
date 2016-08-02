const defaultConfig = require('./extendDefaultConfig');

describe('extendDefaultConfig()', () => {

  it('should contain default properties', () => {

    const config = defaultConfig({

      tmp: './temp/',

      script: {
        extensions: ['.es6', '.jsx']
      },

      webpack: {
        module: {
          loaders: [
            'foobar'
          ]
        }
      }

    });

    expect(config)
      .has.a.property('src', './src/')
    ;
    expect(config)
      .has.a.property('style')
      .has.a.property('extensions')
      .and.is.deep.equal(['.css', '.scss'])
    ;
    expect(config)
      .has.a.property('asset')
      .has.a.property('extensions')
      .and.is.deep.equal(['.jpeg', '.jpg', '.gif', '.png', '.svg', '.woff', '.ttf', '.eot'])
    ;

  });

  it('should contain replaced properties', () => {

    const config = defaultConfig({

      tmp: './temp/',

      script: {
        extensions: ['.es6', '.jsx']
      },

      webpack: {
        module: {
          loaders: [
            'foobar'
          ]
        }
      }

    });

    expect(config)
      .has.a.property('tmp', './temp/')
    ;
    expect(config)
      .has.a.property('script')
      .has.a.property('extensions')
      .and.is.deep.equal(['.es6', '.jsx'])
    ;
    expect(config)
      .has.a.property('webpack')
      .has.a.property('module')
      .has.a.property('loaders')
      .and.is.deep.equal(['foobar'])
    ;

  });

  it('should deep merge the important keys of the other configs', () => {

  });

});
