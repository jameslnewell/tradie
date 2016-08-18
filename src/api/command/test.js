import path from 'path';
import createTestConfig from '../webpack/createTestConfig';
import findTestFiles from '../findTestScriptFiles';
import runWebpack from '../runWebpack';
import runTestBundle from '../runInProcess';

export default options => {
  const {watch, dest} = options;

  const bundlePath = path.resolve(dest, 'tests.js'); //FIXME:

  return new Promise((resolve, reject) => {

    findTestFiles(options)
      .then(testFiles => {

        const webpackConfig = createTestConfig({watch, files: testFiles, ...options});

        //plugin hook
        options.emit('test.webpack.config', webpackConfig);

        runWebpack(webpackConfig, {watch, virtual: true}, (stats, fs) => {

          if (stats.errors.length > 0) {
            //TODO: figure out how to handle/display errors
            stats.errors.forEach(moduleError => console.error(moduleError));

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
