import fs from 'fs';
import path from 'path';

import createTestConfig from '../webpack/createTestConfig';
import findTestFiles from '../findTestScriptFiles';
import runWebpack from '../runWebpack';
import runTestBundle from '../runInProcess';

/**
 *
 * @param   {object}          options
 * @param   {boolean}         [options.watch=false]
 * @param   {function}        [options.exclude=undefined]   A filter function for excluding files from being tested
 * @returns {Promise}
 */
export default options => {
  const {
    src,
    dest,
    watch = false
  } = options;

  const bundlePath = path.resolve(dest, 'tests.js'); //FIXME:

  return new Promise((resolve, reject) => {

    findTestFiles(options)

      .then(files => {

        //include the setup file
        if (fs.existsSync(path.join(src, '_.test.js'))) {
          files.unshift(path.join(src, '_.test.js'));
        }

        const webpackConfig = createTestConfig({...options, watch, files});

        //plugin hook
        options.emit('test.webpack.config', webpackConfig);

        return runWebpack(webpackConfig, {watch, virtual: true}, (stats, fs) => {
          const json = stats.toJson();

          if (json.errors.length > 0) {
            //TODO: figure out how to handle/display errors
            json.errors.forEach(moduleError => console.error(moduleError));

            if (watch) {

              //if we're watching we might recover if the file is fixed
              return;

            } else {

              //if we're not watching then we can't recover so fail
              return reject();

            }

          }

          //TODO: what if webpack splits it into more than one chunk?)
          const bundle = fs.readFileSync(bundlePath);

          return runTestBundle(bundle.toString())
            .then(result => {

              options.emit('test.result', result);

              //if we're not watching then we're done
              if (!watch) {
                if (result.exitCode !== 0) {
                  reject();
                } else {
                  // resolve();
                }
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
