import logger from '../lib/logger';
import bundleStyles from '../lib/styles/bundle';

export const name = 'bundle-styles';
export const desc = 'Bundle style files';

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
      'styles.bundle.finished',
      result => buildLogger.styleBundleFinished(result)
    )
    .on(
      'styles.bundling.finished',
      result => buildLogger.styleBundlingFinished(result)
    )
  ;

  return bundleStyles({args, config: config.styles, emitter});
}
