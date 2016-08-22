import chalk from 'chalk';
import lint from '../lint';
import findScriptFiles from '../findScriptFiles';

/**
 *
 * @param   {object}          options
 * @param   {function}        [options.exclude=undefined]   A filter function for excluding files from being linted
 * @returns {Promise}
 */
export default options => {

  return findScriptFiles(options)
    .then(files => lint(files, options)
      .then(result => {

        //return an error exit code
        if (result.errors) {
          return Promise.reject();
        }

        //exit successfully with a message (because the linter doesn't show any messages)
        if (result.errors === 0 && result.warnings === 0) {
          console.log(chalk.green('OK.'));
        }

      })
    )
  ;

}
