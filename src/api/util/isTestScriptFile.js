const extToRegex = require('ext-to-regex');
const isScriptFile = require('./isScriptFile')

module.exports = (file, config) => {

  //exclude files which aren't scripts
  if (!isScriptFile(file, config)) {
    return false;
  }

  //exclude files that don't have a `.test.<ext>` extension
  if (!extToRegex(config.script.extensions.map(extension => `.test${extension}`)).test(file)) {
    return false;
  }

  return true;
};
