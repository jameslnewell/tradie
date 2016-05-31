import path from 'path';
import chalk from 'chalk';
import del from 'promised-del';

export const name = 'clean';
export const desc = 'Clean script and style bundles';

export function exec(tradie) {
  const {root, config: {dest, tmp}} = tradie;

  tradie
    .on('cleaning.finished', () => console.log(chalk.green(` => cleaned`)))
  ;

  tradie.emit('cleaning.started');
  return del([
    path.join(dest, '*'), path.join(dest, '.*'),
    path.join(tmp, '*'), path.join(tmp, '.*')
  ])
    .then(() => tradie.emit('cleaning.finished'))
    .then(() => 0)
  ;

}
