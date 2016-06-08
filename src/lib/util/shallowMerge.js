
/**
 * Combine settings from two configuration objects, merge any objects and arrays
 * @param   {object} defaultConfig
 * @param   {object} userConfig
 * @returns {object} Returns a new config object
 */
export default function mergeDefaultConfig(defaultConfig, userConfig) {
  const config = {...defaultConfig};

  Object.keys(userConfig).forEach(key => {
    if (Array.isArray(userConfig[key]) && Array.isArray(defaultConfig[key])) {
      config[key] = [].concat(defaultConfig[key], userConfig[key]);
    } else if (typeof userConfig[key] === 'object' && typeof defaultConfig[key] === 'object') {
      config[key] = {...defaultConfig[key], ...userConfig[key]};
    } else {
      config[key] = userConfig[key];
    }
  });

  return config;
}
