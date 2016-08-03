import path from 'path';
import glob from 'glob';

/**
 * Recursively list files in the `./src` directory
 * @params  {object}  config  The tradie config
 * @returns {Promise<Array<string>>}
 */
export default function(config) {
  const {src} = config;
  return new Promise((resolve, reject) => {
    glob('**/*', {cwd: src}, (err, files) => {
      if (err) return reject(err);
      return resolve(files.map(file => path.resolve(src, file)));
    });
  });
}
