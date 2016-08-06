import webpack from 'webpack';
import colorsAreSupported from 'supports-color';
import deepMerge from '../util/deepMerge';

import createCommonConfig from './util/createCommonConfig';
import ignoreStyles from './util/ignoreStyles';
import ignoreAssets from './util/ignoreAssets';

const runner = `

(function() {

  const fs = require('fs');
  const Mocha = require('${require.resolve('mocha')}');
  Mocha.reporters.Base.window.width = ${process.stdout.columns || 80};
  Mocha.reporters.Base.symbols.dot = '.';

  const mocha = new Mocha({
    ui: 'bdd',
    reporter: 'spec',
    useColors: ${colorsAreSupported ? 'true' : 'false'},
  });
  
  mocha.suite.emit('pre-require', global, '', mocha);
  
  setTimeout(function() {
    mocha.run(failures => {
      process.send(
        JSON.stringify({
          coverage: global.__coverage__ //FIXME: this is a hack for tradie-plugin-coverage
        }),
        () => process.exit(failures ? 1 : 0)
      );
    });
  }, 100);

})();

`;

export default function createTestConfig(options) {
  const {src, dest, files,
    style: {extensions: styleExtensions},
    asset: {extensions: assetExtensions},
    webpack: extraWebpackConfig
  } = options;

  let webpackConfig = createCommonConfig(options);

  //replace/ignore (S)CSS in the tests - it doesn't get displayed
  ignoreStyles({extensions: styleExtensions}, webpackConfig);

  //replace/ignore assets in the tests
  ignoreAssets({extensions: assetExtensions}, webpackConfig);

  webpackConfig.plugins.push(
    new webpack.BannerPlugin(
      {banner: runner, raw: true, entryOnly: true}
    )
  );

  //merge common and test config
  webpackConfig = {

    ...webpackConfig,

    target: 'node',
    devtool: 'inline-source-map',

    context: src,

    entry: {
      tests: files
    },

    output: {
      path: dest,
      filename: '[name].js'
    }

  };

  //merge extra webpack config
  webpackConfig = deepMerge(webpackConfig, extraWebpackConfig);

  return webpackConfig;
}
