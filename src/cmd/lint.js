import logger from '../lib/logger';
import lint from '../lib/scripts/lint';

export const name = 'lint';
export const desc = 'Lint script files';

export function exec({args, config, emitter}) {

  emitter.on(
    'scripts.linting.finished',
    result => logger(args).lintingFinished(result)
  );

  return lint(config.scripts.src, emitter);
}
