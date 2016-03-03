import logger from '../lib/logger';
import lintScripts from '../lib/scripts/lint';
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

export function exec({args, config, emitter}) {
  const {watch} = args;
  const buildLogger = logger(args);

  emitter
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

  return lintScripts(config.scripts.src, config.scripts.extensions, emitter)
    .then(code => {

      if (!watch && code !== 0) {
        return code;
      }

      return Promise.all([
        bundleScripts({args, config: config.scripts, emitter,
          onChange: (files) => lintScripts(files, config.scripts.extensions, emitter)
        }),
        bundleStyles({args, config: config.styles, emitter})
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
