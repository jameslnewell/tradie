import fs from 'fs';
import vm from 'vm';
import path from 'path';
import resolve from 'resolve';

function createContext(filename) {

  //https://nodejs.org/api/globals.html
  const context = {

    global: context,

    process: {
      env: {},
      cwd: () => '.',
      argv: '',
      stdin: {},
      stdout: process.stdout,
      stderr: process.stdin
    },

    require: createSandboxedRequire({
      basedir: path.dirname(filename)
    }),

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
        displayErrors: true
      });

      return context.module.exports;

    }

  };
};

export default function runInSandbox(code) {

  const context = createContext(__dirname); //FIXME:

  const result = vm.runInNewContext(code, context);
  console.log(result, context);

  return Promise.resolve(0);
}