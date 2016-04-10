import path from 'path';
import {CLIEngine} from 'eslint';

/**
 * Create a linter
 * @param   {object}  options
 * @param   {object}  options.emitter
 * @param   {array}   options.extensions
 * @returns {Function}
 */
export default function(options) {
  const {extensions, emitter} = options;

  return files => new Promise((resolve, reject) => {

    emitter.emit('scripts.linting.started');
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

      emitter.emit('scripts.linting.finished', {
        time: Date.now() - startTime,
        errors: report.errorCount
      });

      if (report.errorCount > 0) {
        return resolve(-1);
      } else {
        return resolve(0);
      }

    } catch (error) {
      reject(error);
    }

  });

}
