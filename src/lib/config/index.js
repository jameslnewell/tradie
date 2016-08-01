import path from 'path';
import {extendDefaultConfig} from 'tradie-utilities';
import readFromFile from './readFromFile';

export default (root = process.cwd(), context = null) => {

  //load and merge the user's config with the default config
  const config = extendDefaultConfig(readFromFile(root));

  //TODO: validate/lint the config

  //resolve paths
  config.src = path.resolve(root, config.src);
  config.dest = path.resolve(root, config.dest);
  config.tmp = path.resolve(root, config.tmp);

  return config;
};
