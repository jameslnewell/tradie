import fs from 'fs';
import path from 'path';
import TradieError from '../../../api/TradieError';

const readESLintConfig = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dir, '.eslintrc'), (readFileError, content) => {
      if (readFileError) return resolve({});
      try {
        resolve(JSON.parse(content.toString()));
      } catch (jsonParseError) {
        reject(jsonParseError);
      }
    });
  });
};

const readBabelConfig = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dir, '.babelrc'), (readFileError, content) => {
      if (readFileError) return resolve({});
      try {
        resolve(JSON.parse(content.toString()));
      } catch (jsonParseError) {
        reject(jsonParseError);
      }
    });
  });
};

const readTradieConfig = (dir, args) => {
  return new Promise((resolve, reject) => {
    try {

      let userConfig = require(path.join(dir, 'tradie.config.js'));

      if (typeof userConfig === 'function') {
        userConfig = userConfig(args);
      }

      resolve(userConfig);

    } catch (requireError) {
      if (requireError.code === 'MODULE_NOT_FOUND') {

        //return an empty config if the file does not exist (which will result in the default config being used)
        resolve({});

      } else {

        //throw an error if the file exists with an error
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
