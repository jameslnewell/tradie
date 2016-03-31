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
  const {args, args: {watch}, config} = tradie;
  const buildLogger = logger(args);

  tradie
    .on(
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

  return lintScripts(config.scripts.src)
    .then(() => {

      return Promise.all([
        bundleScripts({args, config: config.scripts, emitter: tradie,
          onChange: (files) => lintScripts(files)
        }),
        bundleStyles({args, config: config.styles, emitter: tradie})
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
