import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';
import merge from 'lodash.mergewith';
import scriptDefaults from './scripts/defaults';
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
    styles: {...styleDefaults, ...userConfig.styles},
    plugins: userConfig.plugins || []
  };

  //merge the environment specific config
  if (config.env && config.env[environment]) {
    config = merge({}, config, config.env[environment], (prev, next) => {
      if (Array.isArray(prev)) {
        return prev.concat(next);
      }
    });
  }

  return config;
}
