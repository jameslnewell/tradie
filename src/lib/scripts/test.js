import path from 'path';
import {spawn} from 'child_process';

import glob from 'glob';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import ConcatSource from 'webpack-core/lib/ConcatSource';
import sourceMapper from 'source-mapper';

import readMochaOptions from '../readMochaOptions';

const mochaSetup = `
//'use strict';

const Mocha = require('mocha');
Mocha.reporters.Base.window.width = ${process.stdout.columns || 80};
Mocha.reporters.Base.symbols.dot = '.';

const _mocha = new Mocha({});
_mocha.ui('bdd');
_mocha.reporter('spec');
_mocha.useColors(true);
_mocha.suite.emit('pre-require', global, '', _mocha);

setTimeout(() => {
  _mocha.run(errors => {
    process.exit(errors ? 1 : 0);
  });
}, 1);

`;

class MochaSetupPlugin {
  apply(compiler) {
    compiler.plugin('compilation', function(compilation) {
      compilation.plugin('optimize-chunk-assets', function(chunks, callback) {
        chunks.forEach(function(chunk) {
          chunk.files.forEach(function(file, i) {
            compilation.assets[file] = new ConcatSource(
              mochaSetup,
              compilation.assets[file]
            );
          });
        });
        callback();
      });
    });
  }
}

/**
 * Bundle and run test files
 * @param   {object} args
 * @param   {object} config
 * @param   {object} emitter
 * @returns {Promise}
 */
export default function({args, config, emitter}) {
  const {watch} = args;
  const {src, dest, extensions, transforms} = config;

  const mochaOptions = readMochaOptions();
  const mochaRequire = mochaOptions.require;

  const findTestFiles = () => {

    let extension = null;

    if (extensions.length > 1) {
      extension = `{${extensions.join(',')}}`;
    } else {
      extension = extensions.join('');
    }

    return new Promise((resolve, reject) => {
      glob(`**/*.test${extension}`, {cwd: src}, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    });

  };

  //bundle the test files
  const createTestBundle = () => {
    return new Promise((resolve, reject) => {

      findTestFiles()
        .then(files => {

          const entries = [].concat(
            mochaRequire,
            files
          ).map(entry => './'+entry); //make the entries local files

          const webpackConfig = {
            target: 'node',
            devtool: 'inline-source-map',
            context: path.resolve(src),
            entry: entries,
            output: {
              path: path.resolve(dest),
              filename: 'bundle.js'
            },
            resolve: {
              extensions: [''].concat(extensions)
            },
            module: {
              loaders: [
                transforms.map(name => ({
                  exclude: /(node_modules)/,
                  loader: 'babel-loader'
                }))
              ],
            },
            plugins: [
              new MochaSetupPlugin()
            ]
          };

          console.log(webpackConfig.loaders);

          const fs = new MemoryFS();
          const compiler = webpack(webpackConfig);

          compiler.outputFileSystem = fs;

          compiler.run((err, stats) => {
            if (err) return reject(err);

            const jsonStats = stats.toJson();

            if (jsonStats.errors.length > 0) {
              console.log(jsonStats.errors.join('\n'));
              reject(jsonStats.errors);
            } else {
              //TODO: what if webpack splits it in more than one chunk?)
              resolve(fs.readFileSync(path.join(path.resolve(dest), 'bundle.js')).toString());
            }

          });

        })
        .catch(reject)
      ;

    });
  };

  //run the test bundle on nodejs
  const runTestBundle = (bundle) => {
    return new Promise((resolve, reject) => {
console.log('running');
      //run in a sub-directory of `tradie` so that the `mocha` package is found
      //FIXME: should probably be run in the `.tradierc` directory
      const node = spawn('node', {cwd: __dirname});

      node
        .on('error', reject)
        .on('exit', resolve)
      ;

      //TODO: handle stream errors
      let stdout = node.stdout;
      let stderr = node.stderr;

      //extract the source map, replace URLs in stack traces from generated bundle with the URLs
      // from the original source files, and pipe the output to the console
      const result = sourceMapper.extract(bundle);
      const stream1 = sourceMapper.stream(result.map);
      const stream2 = sourceMapper.stream(result.map);
      stdout = stdout.pipe(stream1);
      stderr = stderr.pipe(stream2);

      //pipe test results to the console
      stdout.pipe(process.stdout);
      stderr.pipe(process.stderr);

      //write the test bundle to node to start executing tests
      node.stdin.write(bundle);
      node.stdin.end();

    });
  };

  return new Promise((resolve, reject) => {

    emitter.emit('scripts.testing.started');
    createTestBundle()
      .then(runTestBundle)
      .then(exitCode => {

        emitter.emit('scripts.testing.finished');

        //if we're not watching then we're done
        if (!watch) {
          resolve(exitCode);
        }

      })
      .catch(reject)
    ;

  });

};