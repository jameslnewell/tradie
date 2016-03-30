import logger from '../lib/logger';
import linter from '../lib/scripts/linter';

export const name = 'lint';
export const desc = 'Lint script files';

export function exec({args, config, emitter}) {

  emitter.on(
    'scripts.linting.finished',
    result => logger(args).lintingFinished(result)
  );

  return linter({extensions: config.scripts.extensions, emitter})(config.scripts.src);
}
