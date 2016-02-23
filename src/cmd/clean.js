import chalk from 'chalk';
import cleanScripts from '../lib/scripts/clean';
import cleanStyles from '../lib/styles/clean';

/**
 * Clean the project files
 * @param   {object} config
 * @param   {object} emitter
 * @returns {Promise}
 */
export default function({config, emitter}) {

  return Promise.all([
    cleanScripts(config.scripts.dest, emitter)
      .then(() => console.log(chalk.green(` => scripts cleaned`))),
    cleanStyles(config.styles.dest, emitter)
      .then(() => console.log(chalk.green(` => styles cleaned`)))
  ]);

}
