import path from 'path';
import logger from '../logger';
import lint from '../lint';
import findScriptFiles from '../findScriptFiles';
import isScriptFile from '../isScriptFile';
import bundleScripts from '../bundle';

export default options => {
  const buildLogger = logger({});

  options
    .once(
      'scripts.linting.finished',
      result => buildLogger.lintingFinished(result)
    )
    .on(
      'scripts.bundle.finished',
      result => buildLogger.scriptBundleFinished(result)
    )
    .on(
      'scripts.bundling.finished',
      result => buildLogger.scriptBundlingFinished(result)
    )
    .on(
      'styles.bundle.finished',
      result => buildLogger.styleBundleFinished(result)
    )
    .on(
      'styles.bundling.finished',
      result => buildLogger.styleBundlingFinished(result)
    )
  ;

  let lintExitCode = 0;

  return Promise.resolve()

    //lint the scripts
    .then(() => findScriptFiles(options)
      .then(files => lint(files, options)
        .then(result => {

          //return an error exit code
          if (result.errors !== 0) {
            lintExitCode = 1;
          }

        })
      )
    )

    //build the bundles
    .then(() => Promise.all([
      bundleScripts({
        ...options,
        onChange: (addedModules, changedModules) => lint([].concat(addedModules, changedModules).filter(file => isScriptFile(file, options)), options)
      })
    ]))

    //reduce the bundle exit codes
    .then(codes => codes.reduce((accum, next) => {
      if (next !== 0) {
        return next;
      } else {
        return accum;
      }
    }, 0))

    //return a single exit code
    .then(bundleExitCodes => {

      //return an error exit code
      if (lintExitCode !== 0 || bundleExitCodes !== 0) {
        throw null;
      }

    })

  ;

};
