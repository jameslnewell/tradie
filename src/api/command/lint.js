import chalk from 'chalk';
import lint from '../lint';
import findScriptFiles from '../findScriptFiles';

export default options => {

  return findScriptFiles(options)
    .then(files => lint(files, options)
      .then(result => {

        //return an error exit code
        if (result.errors) {
          console.log(chalk.red('ERR!'));
          throw null;
        } else if (result.warnings) {
          console.log(chalk.yellow('OK.'));
        } else {
          console.log(chalk.green('OK.'));
        }

      })
    )
  ;

}
