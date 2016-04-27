import path from 'path';
import mergewith from 'lodash.mergewith';
import webpack from 'webpack';
import concatWithPrevArray from '../../../util/concatWithPrevArray';
import createCommonConfig from './createCommonConfig';

const mochaSetup = `

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
  const {root, config: {src, dest, scripts, tests}, mocha: {files, requires}} = options;

  //merge the test specific settings
  const mergedScripts = mergewith({}, scripts, tests, concatWithPrevArray);

  const config = createCommonConfig({
    ...options,
    config: {
      ...options.config,
      scripts: mergedScripts
    }
  });

  config.plugins.push(
    new webpack.BannerPlugin(
      mochaSetup,
      {raw: true, entryOnly: true}
    )
  );

  return {
    ...config,

    target: 'node',
    devtool: 'inline-source-map',

    entry: {
      tests: [].concat(
        requires, //TODO: check if the bundle starts with './' and warn if it doesn't
        files.map(entry => './' + entry)
      )
    },
    context: path.resolve(root, src),

    output: {
      path: path.resolve(root, dest),
      filename: '[name].js'
    }

  };
}
