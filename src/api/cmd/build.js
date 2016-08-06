import path from 'path';
import logger from '../logger';
import lint from '../lint';
import findScriptFiles from '../findScriptFiles';
import isScriptFile from '../isScriptFile';
import bundleScripts from '../bundle';

export const name = 'build';
export const desc = 'Lint and bundle script and style files';

export const hint = yargs => {
  return yargs
    .option('w', {
      alias: 'watch',
      default: false
    })
    .option('optimize', {
      default: false
    })
  ;
};

export const context = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'optimize';
  } else {
    return null;
  }
};

export const exec = tradie => {
  const {root, args, config: {src}} = tradie;
  const config = tradie.config;
  const buildLogger = logger(args);

  tradie
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
    .then(() => findScriptFiles(config)
      .then(files => lint(files, config)
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
        ...tradie,
        onChange: (addedModules, changedModules) => lint([].concat(addedModules, changedModules).filter(file => isScriptFile(file, config)), config)
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
