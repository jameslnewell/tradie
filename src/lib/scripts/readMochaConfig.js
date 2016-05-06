import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';

const defaultOptions = {
  reporter: 'spec',
  requires: []
};

/**
 * Load and merge the user configuration
 * @returns {object}
 */
export default function() {
  const file = path.join(process.cwd(), '.mocharc');

  //load the mocha options
  let userOptions = {};

  if (fs.existsSync(file)) {
    try {
      userOptions = JSON5.parse(fs.readFileSync(file));
    } catch (err) {
      throw new Error(`Error reading mocha options from file ${file}`);
    }
  }

  //TODO: cast `require` to be an array
  return {
    ...defaultOptions,
    ...userOptions
  };

}
