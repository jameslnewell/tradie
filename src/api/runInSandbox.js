/* eslint-disable */
import fs from 'fs';
import vm from 'vm';
import resolve from 'resolve';

function createContext(filename) {

  //https://nodejs.org/api/globals.html
  const context = {

    process: {
      version: process.version,
      env: {},
      cwd: () => '.',
      argv: '',
      stdin: {},
      stdout: process.stdout,
      stderr: process.stderr //TODO: get stdout/err working
    },
    process,

    //require: createSandboxedRequire({
    //  basedir: path.dirname(filename)
    //}),
    require: require,  //TODO: use a sandboxed version

    module: {
      paths: [],
      exports: {}
    },

    get exports() {
      return context.module.exports;
    },

    set exports(val) {
      context.module.exports = val;
    },

    console,

    clearImmediate,
    clearInterval,
    clearTimeout,
    setImmediate,
    setInterval,
    setTimeout,

    Date

    //...sandbox

  };
  context.global = context;

  return context;
}

const createSandboxedRequire = ({basedir = __dirname}) => {
  return function sandboxedRequire(id) {

    if (resolve.isCore(id)) {
      return require(id);
    } else {

      const file = resolve.sync(id, {basedir});
      const code = fs.readFileSync(file);
      const context = createContext(file);

      vm.runInNewContext(code, context, {
        filename: file,
        displayErrors: true,
        timeout: 2000
      });

      return context.module.exports;

    }

  };
};

export default function(code) {
  const context = createContext(__dirname); //FIXME:
  const result = vm.runInNewContext(code, context, {timeout: 2000});
  return Promise.resolve(context);
}
