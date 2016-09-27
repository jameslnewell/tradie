import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';
import TradieError from '../../../api/TradieError';

const readESLintConfig = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dir, '.eslintrc'), (readFileError, content) => {
      if (readFileError) return resolve({});
      try {
        resolve(JSON5.parse(content.toString()));
      } catch (jsonParseError) {
        reject(new TradieError('Unable to read ".eslintrc"', jsonParseError));
      }
    });
  });
};

const readBabelConfig = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dir, '.babelrc'), (readFileError, content) => {
      if (readFileError) return resolve({});
      try {
        resolve(JSON5.parse(content.toString()));
      } catch (jsonParseError) {
        reject(new TradieError('Unable to read ".babelrc"', jsonParseError));
      }
    });
  });
};

const readTradieConfig = (dir, args) => {
  return new Promise((resolve, reject) => {
    const userConfigPath = path.join(dir, 'tradie.config.js');
    try {

      let userConfigData = require(userConfigPath);

      if (typeof userConfigData === 'function') {
        userConfigData = userConfigData(args);
      }

      resolve(userConfigData);

    } catch (requireError) {
      if (requireError.code === 'MODULE_NOT_FOUND') {

        //if the file does not exist, then ignore the error, otherwise it is a user config error
        fs.stat(userConfigPath, err => {
          if (err) {

            //ignore the error if the user config file does not exist
            resolve({});

          } else {

            //throw an error if the user config file exists but errors whilst executing it
            reject(new TradieError('Unable to read "tradie.config.js"', requireError));

          }
        });

      } else {

        //throw an error if the user config file exists but errors whilst executing it
        reject(new TradieError('Unable to read "tradie.config.js"', requireError));

      }
    }
  });
};

export default (args) => {
  const dir = process.cwd();

  //read the user's tradie config
  return readTradieConfig(dir, args)
    .then(userConfig => {
      const promises = [];

      //if the user hasn't provided config for eslint, try and load it from a file
      if (!userConfig.eslint) {
        promises.push(readESLintConfig(dir).then(eslint => ({eslint})))
      }

      //if the user hasn't provided config for babel, try and load it from a file
      if (!userConfig.babel) {
        promises.push(readBabelConfig(dir).then(babel => ({babel})))
      }

      //merge the eslint and babel configs into the user's tradie config
      return Promise.all(promises)
        .then(results => results.reduce((accum, next) => {
          return {...accum, ...next};
        }, userConfig))
      ;
    })
  ;

};
