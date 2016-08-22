import path from 'path';
import glob from 'glob';

/**
 * Recursively find all files in the source directory
 * @params  {object}    options
 * @params  {string}    options.src
 * @params  {function}  [options.exclude]
 * @returns {Promise<Array<string>>}
 */
export default function(options) {
  const {src, exclude} = options;

  let promise = new Promise((resolve, reject) => {
    glob('**/*', {cwd: src}, (err, files) => {
      if (err) return reject(err);
      return resolve(files.map(file => path.resolve(src, file)));
    });
  });

  //exclude files
  if (exclude) {
    promise = promise.then(files => files.filter(file => exclude(path.relative(src, file))));
  }

  return promise;
}
