import logger from '../lib/logger';
import bundleScripts from '../lib/scripts/bundle';

export const name = 'bundle-scripts';
export const desc = 'Bundle script files';

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
  ;

  return bundleScripts({args, config: config.scripts, emitter});
}
