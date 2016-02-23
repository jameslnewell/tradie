import logger from '../lib/logger';
import lint from '../lib/scripts/lint';

export const name = 'lint';
export const desc = 'Lint script files';

/**
 * Lint the project files
 * @param   {object} args
 * @param   {object} config
 * @param   {object} emitter
 * @returns {void}
 */
export function run({args, config, emitter}) {

  const log = logger(args);
  emitter.on('scripts:lint:finished', result => log.lintFinished(result));

  return lint(config.scripts.src, emitter);
}
