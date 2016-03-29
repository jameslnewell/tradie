import {createClientConfig} from './createWebpackConfig';

describe('createWebpackConfig', () => {

  it.only('should stuff', () => {

    const config = createWebpackConfig({
      root: '.',
      env: 'production',
      config: {
        scripts: {
          src: './src',
          dest: './dest',
          bundles: ['./index.js'],
          loaders: [],
          plugins: [],
          extensions: ['.js']
        },
        styles: {}
      }
    }, {target: 'node'});
    console.log(config);

  });

});
