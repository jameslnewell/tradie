import logger from '../lib/logger';
import bundleScripts from '../lib/scripts/bundle';
import bundleStyles from '../lib/styles/bundle';

export const name = 'bundle';
export const desc = 'Bundle script and style files';


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
  const buildLogger = logger(args);

  emitter
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

  return Promise.all([
    bundleScripts({args, config: config.scripts, emitter}),
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

}
