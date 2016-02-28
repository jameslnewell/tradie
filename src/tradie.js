import yargs from 'yargs';
import {EventEmitter} from 'events';
import readConfig from './lib/readConfig';
import executePlugins from './lib/executePlugins';

import * as initCommand from './cmd/init';
import * as cleanCommand from './cmd/clean';
import * as lintCommand from './cmd/lint';
import * as bundleCommand from './cmd/bundle';
import * as bundleScriptsCommand from './cmd/bundle-scripts';
import * as bundleStylesCommand from './cmd/bundle-styles';
import * as buildCommand from './cmd/build';
import * as testCommand from './cmd/test';

export default function() {
  return new Promise((resolve, reject) => {

    const env = process.env.NODE_ENV || 'development';

    const emitter = new EventEmitter();

    const argParser = yargs
      .usage('\nUsage: \n  $0 <command> [options]')
      .demand(1)
      .strict()
      .help('h')
      .alias('h', 'help')
      .showHelpOnFail()
    ;

    //load the config
    let config = {};
    try {
      config = readConfig(env);
    } catch (error) {
      return reject(error);
    }

    const tradie = {

      env,
      config,

      on: (...args) => emitter.on(...args),
      once: (...args) => emitter.once(...args),
      off: (...args) => emitter.off(...args),
      emit: (...args) => emitter.emit(...args),

      /**
       * Register a new command
       * @param   {object}    command
       * @param   {string}    command.name
       * @param   {string}    command.desc
       * @param   {function}  command.hint
       * @param   {function}  command.exec
       * @returns {tradie}
       */
      cmd: (command) => {

        const name = command.name;

        argParser.command(
          command.name,
          command.desc,
          command.hint,
          argv => {

            try {

              const args = {
                ...argv,
                env: env
              };

              emitter.emit('command.started', {name, args, config});
              Promise.resolve(command.exec({args, config, emitter}))
                .then(
                  code => {
                    emitter.emit('command.finished', {name, args, config, code});
                    resolve(code);
                  },
                  error => reject(error)
                )
              ;

            } catch (error) {
              reject(error);
            }

          }
        );

        return tradie;
      }

    };

    //load the commands
    tradie
      .cmd(initCommand)
      .cmd(cleanCommand)
      .cmd(lintCommand)
      .cmd(bundleCommand)
      .cmd(bundleScriptsCommand)
      .cmd(bundleStylesCommand)
      .cmd(buildCommand)
      .cmd(testCommand)
    ;

    //log each event
    const oldEmitterEmit = emitter.emit;
    emitter.emit = (...args) => {
      //console.log('tradie:', args);
      return oldEmitterEmit.apply(emitter, args);
    };

    //load the plugins
    executePlugins(tradie)
      .then(() => {

        //parse the command line arguments and run the appropriate command
        argParser
          .option('v', {
            alias: 'verbose',
            default: false
          })
          .argv
        ;

      })
      .catch(reject)
    ;

  });
}
