import path from 'path';
import listTestFiles from '../lib/scripts/listTestFiles';
import readMochaConfig from '../lib/scripts/readMochaConfig';
import runWebpack from '../lib/scripts/runWebpack';
import runBundle from '../lib/scripts/runBundle';
import createTestConfig from '../lib/scripts/configuration/createTestConfig';

export const name = 'test';
export const desc = 'Test script files';

export function hint(yargs) {
  return yargs.option('w', {
    alias: 'watch',
    default: false
  });
}

export function exec(options) {
  const {root, args: {watch}, config: {dest}} = options;

  const mochaConfig = readMochaConfig();
  const bundlePath = path.resolve(root, dest, 'tests.js');

  return new Promise((resolve, reject) => {

    listTestFiles(options)
      .then(files => {

        const webpackConfig = createTestConfig({
          ...options,
          mocha: {...mochaConfig, files}
        });

        runWebpack(webpackConfig, {watch, virtual: true}, (err, stats, fs) => {
          if (err) return resolve(err);

          if (stats.errors.length > 0) {
            //TODO: figure out how to handle/display errors
            stats.errors.forEach(moduleError => console.error(moduleError));
            return Promise.resolve();
          }

          //TODO: what if webpack splits it into more than one chunk?)
          runBundle(fs.readFileSync(bundlePath))
            .then(exitCode => {

              //if we're not watching then we're done
              if (!watch) {
                resolve(exitCode);
              }

            })
            .catch(reject)
          ;

        })
          .catch(reject)
        ;

      })
      .catch(reject)
    ;

  });

}
