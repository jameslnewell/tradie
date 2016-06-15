import path from 'path';
import mergewith from 'lodash.mergewith';
import webpack from 'webpack';

import createCommonBundleConfig from './createCommonBundleConfig';
import deepMerge from '../util/deepMerge';

const runner = `

const Mocha = require('mocha');
Mocha.reporters.Base.window.width = ${process.stdout.columns || 80};
Mocha.reporters.Base.symbols.dot = '.';

const _mocha = new Mocha({});
_mocha.ui('bdd');
_mocha.reporter('spec');
_mocha.useColors(true);
_mocha.suite.emit('pre-require', global, '', _mocha);

setTimeout(() => {
  _mocha.run(errors => {
    process.exit(errors ? 1 : 0);
  });
}, 1);
`;

export default function createTestConfig(options) {
  const {src, dest, files, webpack: extraWebpackConfig} = options;

  let config = createCommonBundleConfig(options);

  config.plugins.push(
    new webpack.BannerPlugin(
      runner,
      {raw: true, entryOnly: true}
    )
  );

  //merge common and test config
  config = {

    ...config,

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
  config = deepMerge(config, extraWebpackConfig);

  return config;
}