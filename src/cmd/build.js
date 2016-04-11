import path from 'path';
import logger from '../lib/logger';
import linter from '../lib/scripts/linter';
import bundleScripts from '../lib/scripts/bundle';
import bundleStyles from '../lib/styles/bundle';

export const name = 'build';
export const desc = 'Lint and bundle script and style files';

export function hint(yargs) {
  return yargs
    .option('w', {
      alias: 'watch',
      default: false
    })
    .option('v', {
      alias: 'verbose',
      default: false
    })
  ;
}

export function exec(tradie) {
  const {root, args, args: {watch}, config, config: {src}} = tradie;
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

  const lintScripts = linter({emitter: tradie, extensions: config.scripts.extensions});

  return lintScripts(path.resolve(root, src))
    .then(() => {

      return Promise.all([
        bundleScripts({
          ...tradie,
          onChange: (addedModules, changedModules) => lintScripts([].concat(addedModules, changedModules))
        }),
        bundleStyles(tradie)
      ])
        .then(codes => codes.reduce((accum, next) => {
          if (next !== 0) {
            return next;
          } else {
            return accum;
          }
        }, 0))
      ;

    })
  ;

}
