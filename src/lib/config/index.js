import path from 'path';
import readFile from './readFile';
import deepMerge from '../util/deepMerge';
import extendDefaultConfig from './extendDefaultConfig';

export default (root = process.cwd(), context = null) => {

  //load and merge the user's config with the default config
  let config = extendDefaultConfig(readFile(root));

  //TODO: validate/lint the config

  //resolve paths
  config.src = path.resolve(root, config.src);
  config.dest = path.resolve(root, config.dest);
  config.tmp = path.resolve(root, config.tmp);

  return config;
};
