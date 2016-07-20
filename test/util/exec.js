const path = require('path');
const spawn = require('child_process').spawn;

export default function exec(args, options) {
  return new Promise((resolve, reject) => {

    const proc = spawn('node', [path.resolve('./dist/bin/tradie.js'), ...args], options);

    if (options.log) {
      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);
    }

    proc.on('error', (err) => {
      reject(err);
    });

    proc.on('exit', (code) => {
      resolve(code);
    });

  });
}
