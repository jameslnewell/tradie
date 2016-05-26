import fs from 'fs';
import path from 'path';
import glob from 'glob';

/**
 * Recursively list script files named `*.test.js` in the `./src` directory
 * @params  {string}  directory     The directory to start looking in
 * @params  {array}   extensions    The extensions
 * @returns {Promise<Array<string>>}
 */
export default function(directory, {extensions}) { //TODO: add functionality to exclude items which do not match a glob pattern

  let globExtension = '';
  if (extensions.length > 1) {
    globExtension = `{${extensions.join(',')}}`;
  } else {
    globExtension = extensions.join('');
  }

  return new Promise((resolve, reject) => {
    glob(`**/*.test${globExtension}`, {cwd: directory, ignore: '_.test.js'}, (err, files) => {
      if (err) return reject(err);

      if (fs.existsSync(path.resolve(directory, '_.test.js'))) { //FIXME: try each of the script extensions
        files.unshift('_.test.js');
      }

      files = files.map(file => path.resolve(directory, file));

      return resolve(files);
    });
  });

}
