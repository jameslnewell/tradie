import yargs from 'yargs';
import {EventEmitter} from 'events';
import getArgs from './lib/getArguments';
import getConfig from './lib/getConfig';

//import initCommand from './cmd/init';
import * as cleanCommand from './cmd/clean';
import * as lintCommand from './cmd/lint';
//import buildCommand from './cmd/build';
import * as testCommand from './cmd/test';

/**
 * Command runner
 */
export default class Runner {

  /**
   * Construct the runner
   * @returns {void}
   */
  constructor() {
    this.emitter = new EventEmitter();
    this.app = yargs
      .usage('\nUsage: \n  $0 <command> [options]')
      .demand(1)
      .strict()
      .help('h')
      .alias('h', 'help')
      .showHelpOnFail()
    ;

    this
      //.cmd(initCommand)
      .cmd(cleanCommand)
      .cmd(lintCommand)
      .cmd(testCommand)
      //.cmd(buildCommand)
    ;

    this.emitter.emit('init', this);

    //track each event
    this.oldEmitterEmit = this.emitter.emit;
    this.emitter.emit = (...args) => {
      console.log('tradie:', args);
      return this.oldEmitterEmit.apply(this.emitter, args);
    };

  }

  on(...args) {
    this.emitter.on(...args);
    return this;
  }

  once(...args) {
    this.emitter.once(...args);
    return this;
  }

  off(...args) {
    this.emitter.off(...args);
    return this;
  }

  /**
   * Add a new command
   * @param   {object}    command
   * @param   {string}    command.name
   * @param   {string}    command.desc
   * @param   {function}  command.hint
   * @param   {function}  command.exec
   * @returns {Runner}
   */
  cmd(command) {

    const name = command.name;

    this.app.command(
      command.name,
      command.desc,
      command.hint,
      argv => {

        const args = getArgs(argv);
        const config = getConfig(args.debug ? 'development' : 'production');

        this.emitter.emit('cmd:enter', {cmd: name, args, config});
        Promise.resolve(command.exec({args, config, emitter: this.emitter}))
          .then(
            () => this.emitter.emit('cmd:exit', {cmd: name, args, config, code: 0}),
            () => this.emitter.emit('cmd:exit', {cmd: name, args, config, code: -1})
          )
        ;

      }
    );

    return this;
  }

  /**
   * Run the current command
   * @returns {Runner}
   */
  run() {

    /*eslint-disable */
    this.app
      .option('v', {
        alias: 'verbose'
      })
      .argv
    ;
    /*eslint-enable */

    return this;
  }

}
