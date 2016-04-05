import path from 'path';
import MochaSetupPlugin from './MochaSetupPlugin';
import createCommonConfig from './createCommonConfig';

export default function createTestConfig(options) {
  const {root, config: {src, dest}, mocha: {files, requires}} = options;

  const config = createCommonConfig(options);

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
