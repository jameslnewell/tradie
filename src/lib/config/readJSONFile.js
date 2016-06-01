import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';

export default function(root) {
  const file = path.resolve(root, '.tradierc');

  //load the user config
  let config = {};
  if (fs.existsSync(file)) {
    try {
      config = JSON5.parse(fs.readFileSync(file));
    } catch (err) {
      throw new Error(`Error reading config file ${file}`);
    }
  }

  return config;
}
