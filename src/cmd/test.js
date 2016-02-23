import testScripts from '../lib/scripts/test';

export const name = 'test';
export const desc = 'Test script files';

export function hint(yargs) {
  return yargs.option('w', {
    alias: 'watch'
  });
}

/**
 * Clean the project files
 * @param   {object} args
 * @param   {object} config
 * @param   {object} emitter
 * @returns {Promise}
 */
export function run({args, config, emitter}) {
  return testScripts(config.scripts, args, emitter);
}
