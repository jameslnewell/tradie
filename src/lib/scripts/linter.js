import path from 'path';
import {CLIEngine} from 'eslint';

/**
 * Create a linter
 * @param   {object}  tradie
 * @returns {Function}
 */
export default function(tradie) {
  const {config: {scripts: {extensions}}} = tradie;

  return files => new Promise((resolve, reject) => {

    tradie.emit('scripts.linting.started');
    const startTime = Date.now();

    const filteredFiles = [].concat(files)

      //exclude files which have an extension but aren't on the extension list
      .filter(file => {
        const ext = path.extname(file);
        return ext === '' || extensions.indexOf(ext) !== -1;
      })

      //exclude files from within node_modules
      .filter(file => !/node_modules/.test(file))

    ;


    //TODO: exclude files not in the src directory

    const cli = new CLIEngine({extensions});

    try {

      const report = cli.executeOnFiles(filteredFiles);
      const formatter = cli.getFormatter('stylish');

      if (report.errorCount + report.warningCount > 0) {
        console.log(formatter(report.results));
      }

      tradie.emit('scripts.linting.finished', {
        time: Date.now() - startTime,
        errors: report.errorCount
      });

      if (report.errorCount > 0) {
        resolve(-1);
        return;
      } else {
        resolve(0);
        return;
      }

    } catch (error) {
      reject(error);
      return;
    }

  });

}
