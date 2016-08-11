import path from 'path';
import del from 'promised-del';
import chalk from 'chalk';

export default options => {
  const {dest, tmp} = options;

  return del([
    path.join(dest, '*'), path.join(dest, '.*'),
    path.join(tmp, '*'), path.join(tmp, '.*')
  ])
    .then(() => console.log(chalk.green('OK.')))
  ;

}
