import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';
import mergewith from 'lodash.mergewith';
import concatWithPrevArray from '../util/concatWithPrevArray';
import scriptDefaults from './scripts/defaults';
import testDefaults from './tests/defaults';
import styleDefaults from './styles/defaults';

/**
 * Load and merge the user configuration
 * @param   {string} [environment]
 * @returns {object}
 */
export default function(environment = 'development') {
  const file = path.join(process.cwd(), '.tradierc');

  //load the user config
  let userConfig = {};

  if (fs.existsSync(file)) {
    try {
      userConfig = JSON5.parse(fs.readFileSync(file));
    } catch (err) {
      throw new Error(`Error reading config file ${file}`);
    }
  }

  //override the default config
  let config = {
    scripts: {...scriptDefaults, ...userConfig.scripts},
    tests: {...testDefaults, ...userConfig.tests},
    styles: {...styleDefaults, ...userConfig.styles},
    plugins: userConfig.plugins || []
  };

  //merge the environment specific config
  if (userConfig.env && userConfig.env[environment]) {
    config = mergewith({}, config, userConfig.env[environment], concatWithPrevArray);
  }

  return config;
}
