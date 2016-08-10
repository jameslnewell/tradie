import path from 'path';
import extendDefaultConfig from '../util/extendDefaultConfig';
import readFromFile from './readFromFile';

export default (root = process.cwd(), context = null) => {

  //load and merge the user's config with the default config
  const config = extendDefaultConfig(readFromFile(root));

  //TODO: validate/lint the config

  //resolve paths
  config.root = path.resolve(root);
  config.src = path.resolve(root, config.src);
  config.dest = path.resolve(root, config.dest);
  config.tmp = path.resolve(root, config.tmp);

  return config;
};
