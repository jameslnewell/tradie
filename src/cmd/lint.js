import logger from '../lib/logger';
import linter from '../lib/scripts/linter';

export const name = 'lint';
export const desc = 'Lint script files';

export function exec(tradie) {
  const {args, config: {src}} = tradie;

  tradie.on(
    'scripts.linting.finished',
    result => logger(args).lintingFinished(result)
  );

  return linter(tradie)(src);
}
