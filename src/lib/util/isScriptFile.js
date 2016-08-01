const path = require('path');
const extToRegex = require('ext-to-regex');

module.exports = (file, config) => {

  //exclude files not in the `./src` directory
  if (path.normalize(file).indexOf(path.normalize(config.src)) !== 0) {
    return false;
  }

  //exclude files that don't have script extensions
  if (!extToRegex(config.script.extensions).test(file)) {
    return false;
  }

  return true;
};
