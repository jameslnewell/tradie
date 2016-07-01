import fs from 'fs';
import path from 'path';

export default function(root) {
  const file = path.resolve(root, '.tradie.js');

  //load the user config
  let config = {};
  if (fs.existsSync(file)) {
    try {
      config = require(file);
    } catch (err) {
      throw new Error(`Error reading config file ${file}`);
    }
  }

  return config;
}
