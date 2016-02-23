import chalk from 'chalk';
import testScripts from '../lib/scripts/test';

/**
 * Clean the project files
 * @param   {object} config
 * @param   {object} emitter
 * @returns {Promise}
 */
export default function({args, config, emitter}) {
  return testScripts(config.scripts, args, emitter);
}
