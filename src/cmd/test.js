import path from 'path';
import findTestFiles from '../lib/findTestFiles';
import runWebpack from '../lib/runWebpack';
import runBundle from '../lib/runBundle';
import createTestConfig from '../lib/webpack/createTestConfig';

export const name = 'test';
export const desc = 'Test script files';

export function hint(yargs) {
  return yargs.option('w', {
    alias: 'watch',
    default: false
  });
}

export function exec(options) {
  const {args: {watch}, config: {src, dest, scripts: {extensions}}} = options;

  const bundlePath = path.resolve(dest, 'tests.js'); //FIXME:

  return new Promise((resolve, reject) => {

    findTestFiles(src, {extensions})
      .then(testFiles => {

        const webpackConfig = createTestConfig(testFiles, options);

        runWebpack(webpackConfig, {watch, virtual: true}, (err, stats, fs) => {
          if (err) return reject(err);

          if (stats.errors.length > 0) {
            //TODO: figure out how to handle/display errors
            stats.errors.forEach(moduleError => console.error(moduleError));
            return Promise.resolve(-1);
          }

          //TODO: what if webpack splits it into more than one chunk?)
          return runBundle(fs.readFileSync(bundlePath))
            .then(
              exitCode => {

                //if we're not watching then we're done
                if (!watch) {
                  resolve(exitCode);
                }

              },
              reject
            )
          ;

        })
          .catch(reject)
        ;

      })
      .catch(reject)
    ;

  });

}
