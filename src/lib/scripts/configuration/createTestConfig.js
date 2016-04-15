import path from 'path';
import mergewith from 'lodash.mergewith';
import concatWithPrevArray from '../../../util/concatWithPrevArray';
import MochaSetupPlugin from './MochaSetupPlugin';
import createCommonConfig from './createCommonConfig';

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

  config.plugins.push(new MochaSetupPlugin());

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
