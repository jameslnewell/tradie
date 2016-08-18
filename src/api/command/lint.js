import chalk from 'chalk';
import lint from '../lint';
import findScriptFiles from '../findScriptFiles';

export default options => {

  return findScriptFiles(options)
    .then(files => lint(files, options)
      .then(result => {

        //return an error exit code
        if (result.errors) {
          return Promise.reject();
        } else if (result.errors === 0 && result.warnings == 0) {
          console.log(chalk.green('OK.'));
        }

      })
    )
  ;

}
