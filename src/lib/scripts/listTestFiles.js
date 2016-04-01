import path from 'path';
import glob from 'glob';

/**
 * Recursively list script files named `*.test.js` in the `src` directory
 * @params  {object}  options
 * @returns {Promise<Array<string>>}
 */
export default function(options) {
  const {root, config: {src, scripts: {extensions}}} = options;

  let globExtension = '';
  if (extensions.length > 1) {
    globExtension = `{${extensions.join(',')}}`;
  } else {
    globExtension = extensions.join('');
  }

  return new Promise((resolve, reject) => {
    glob(`**/*.test${globExtension}`, {cwd: path.resolve(root, src)}, (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });

}
