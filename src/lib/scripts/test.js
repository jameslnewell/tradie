import path from 'path';
import glob from 'glob';

import runWebpack from './runWebpack';
import runBundle from './runBundle';
import readMochaOptions from '../readMochaOptions';
import MochaSetupPlugin from './MochaSetupPlugin';

/**
 * Bundle and run test files
 * @param   {object} args
 * @param   {object} config
 * @param   {object} emitter
 * @returns {Promise}
 */
export default function({args, config, emitter}) {
  const {watch} = args;
  const {src, dest, extensions, loaders} = config;

  const mochaOptions = readMochaOptions();
  const mochaRequire = mochaOptions.require;

  const findTestFiles = () => {

    let extension = null;

    if (extensions.length > 1) {
      extension = `{${extensions.join(',')}}`;
    } else {
      extension = extensions.join('');
    }

    return new Promise((resolve, reject) => {
      glob(`**/*.test${extension}`, {cwd: src}, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    });

  };

  //bundle the test files
  const createTestBundle = () => {
    return new Promise((resolve, reject) => {

      const bundlePath = path.join(path.resolve(dest), 'tests.js');

      findTestFiles()
        .then(files => {

          const entries = [].concat(
            mochaRequire,
            files
          ).map(entry => './' + entry); //make the entries local files - TODO: should we force tradie users to do this themselves?

          const webpackConfig = {

            context: path.resolve(src),

            entry: entries,

            output: {
              path: path.dirname(bundlePath),
              filename: path.basename(bundlePath)
            },

            target: 'node',
            devtool: 'inline-source-map',

            resolve: {
              extensions: [''].concat(extensions)
            },

            module: {
              loaders: [
                loaders.map(loader => ({
                  exclude: /(node_modules)/,
                  loader
                }))
              ]
            },

            plugins: [
              new MochaSetupPlugin()
              //TODO: evaluate RewirePlugin
            ]

          };

          runWebpack(webpackConfig, {watch, virtual: true, afterCompile: (err, stats, fs) => {

            if (stats.errors.length > 0) {
              //TODO: figure out how to handle/display errors
              console.error(stats.errors);
              return;
            }

            //TODO: what if webpack splits it in more than one chunk?)
            runBundle(fs.readFileSync(bundlePath));

          }});

        })
        .catch(reject)
      ;

    });
  };

  return new Promise((resolve, reject) => {

    createTestBundle()
      .then(exitCode => {

        //if we're not watching then we're done
        if (!watch) {
          resolve(exitCode);
        }

      })
      .catch(reject)
    ;

  });

};