import path from 'path';
import {extendDefaultConfig} from 'tradie-util';
import readFromFile from './readFromFile';

export default (root = process.cwd()) => {

  //load and merge the user's config with the default config
  const config = extendDefaultConfig(readFromFile(root));

  //TODO: validate/lint the config

  //resolve paths
  config.src = path.resolve(root, config.src);
  config.dest = path.resolve(root, config.dest);
  config.tmp = path.resolve(root, config.tmp);

  //TODO: merging context specific config

  return config;
};
