import path from 'path';
import findTestFiles from '../lib/findTestFiles';
import runWebpack from '../lib/runWebpack';
import runInProcess from '../lib/runInProcess';
import createTestBundleConfig from '../lib/webpack/createTestBundleConfig';

export const name = 'test';
export const desc = 'Test script files';

export function hint(yargs) {
  return yargs.option('w', {
    alias: 'watch',
    default: false
  });
}

export const context = args => 'test';

export function exec(tradie) {
  const {args: {watch}, config: {src, dest, scripts: {extensions}}} = tradie;

  const bundlePath = path.resolve(dest, 'tests.js'); //FIXME:

  return new Promise((resolve, reject) => {

    findTestFiles(src, {extensions})
      .then(testFiles => {

        const webpackConfig = createTestBundleConfig({watch, optimize: false, files: testFiles, ...tradie.config});

        //plugin hook
        tradie.emit('test.webpack-config', webpackConfig);

        runWebpack(webpackConfig, {watch, virtual: true}, (err, stats, fs) => {
          if (err) return reject(err);

          if (stats.errors.length > 0) {
            //TODO: figure out how to handle/display errors
            stats.errors.forEach(moduleError => console.error(moduleError));
            return reject(-1);
          }

          //TODO: what if webpack splits it into more than one chunk?)
          const bundle = fs.readFileSync(bundlePath);
          const hack = {bundle};

          //plugin hook
          tradie.emit('test.bundle', hack);
require('fs').writeFileSync('out.txt', hack.bundle);
          return runInProcess(hack.bundle)
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
