import chalk from 'chalk';
import cleanScripts from '../lib/scripts/clean';
import cleanStyles from '../lib/styles/clean';

export const name = 'clean';
export const desc = 'Clean script and style bundles';

export function exec({config, emitter}) {

  emitter
    .on('scripts.cleaning.finished', () => console.log(chalk.green(` => scripts cleaned`)))
    .on('styles.cleaning.finished', () => console.log(chalk.green(` => styles cleaned`)))
  ;

  return Promise.all([
    cleanScripts(config.scripts.dest, emitter),
    cleanStyles(config.styles.dest, emitter)
  ]);

}
