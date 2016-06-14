const path = require('path');
const spawn = require('child_process').spawn;

function run(args, options) {
  return new Promise((resolve, reject) => {

    const proc = spawn(path.resolve('./dist/bin/tradie.js'), args, options);

    if (options.log) {
      proc.stdout.pipe(process.stdout);
    }

    proc.on('error', (err) => {
      reject(err);
    });

    proc.on('exit', (code) => {
      resolve(code);
    });

  });
}

describe('lint', () => {

  it('should exit with 0 when there are no linting errors', () => {
    return run(['lint'], {cwd: path.resolve('./test/fixture/lint-ok')})
      .then(code => expect(code).to.be.equal(0))
    ;
  });

  it('should exit with 1 when there are linting errors', () => {
    return run(['lint'], {cwd: path.resolve('./test/fixture/lint-err')})
      .then(code => expect(code).to.be.equal(1))
    ;
  });

});