import fs from 'fs';
import path from 'path';
import TradieError from '../TradieError';

export default function(root) {
  const file = path.resolve(root, 'tradie.config.js');

  //load the user config
  let config = {};
  if (fs.existsSync(file)) {
    try {
      config = require(file);
    } catch (requireError) {
      throw new TradieError(`Error reading config file ${file}`, requireError);
    }
  }

  return config;
}
