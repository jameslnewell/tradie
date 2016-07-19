import yargs from 'yargs';
import {EventEmitter} from 'events';
import readConfig from './lib/config';
import executePlugins from './lib/executePlugins';
import deepMerge from './lib/util/deepMerge';

import * as cleanCommand from './cmd/clean';
import * as lintCommand from './cmd/lint';
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
      .version()
      .help('h')
      .alias('h', 'help')
      .option('v', {
        alias: 'verbose',
        default: false
      })

      .showHelpOnFail()
    ;

    //load the config
    let config = {};
    try {
      config = readConfig(process.cwd());
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

        argParser.command(
          command.name,
          command.desc,
          command.hint,

          args => {

            const run = () => {
              try {

                emitter.emit('command.started', {...tradie, args, name: command.name});
                Promise.resolve(command.exec({...tradie, args}))
                  .then(
                    exitCode => {

                      //allow plugins to modify the exit code
                      const event = {...tradie, args, name: command.name, exitCode};
                      emitter.emit('command.finished', event);
                      resolve(event.exitCode);

                    },
                    error => reject(error)
                  )
                ;

              } catch (error) {
                reject(error);
              }
            };

            //figure out the context and merge the config
            tradie.context = command.context ? command.context(args) : null;
            if (config.$ && config.$[tradie.context]) {
              tradie.config = deepMerge(tradie.config, config.$ && config.$[tradie.context]);
            }
            delete tradie.config.$;

            //load the plugins
            executePlugins(tradie)
              .then(() => {
                run();
              })
              .catch(reject)
            ;

          }
        );

        return tradie;
      }
    };

    //load the commands
    tradie
      .cmd(cleanCommand)
      .cmd(lintCommand)
      .cmd(buildCommand)
      .cmd(testCommand)
    ;

    //log each event
    //const oldEmitterEmit = emitter.emit;
    //emitter.emit = (...args) => {
    //  console.log('tradie:', args);
    //  return oldEmitterEmit.apply(emitter, args);
    //};

    //parse the command line arguments and run the appropriate command
    argParser.argv; //eslint-disable-line

  });
}
