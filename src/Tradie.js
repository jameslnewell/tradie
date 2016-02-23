import yargs from 'yargs';
import {EventEmitter} from 'events';
import getArgs from './lib/getArguments';
import getConfig from './lib/getConfig';

//import initCommand from './cmd/init';
import cleanCommand from './cmd/clean';
import lintCommand from './cmd/lint';
//import buildCommand from './cmd/build';
import testCommand from './cmd/test';

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
    //
    //this.cmd(
    //  'init',
    //  'Create a new project',
    //  initCommand
    //);
    //
    this.cmd(
      'clean',
      'Clean script and style bundles',
      cleanCommand
    );

    this.cmd(
      'lint',
      'Lint script files',
      lintCommand
    );

    //this.cmd(
    //  'build',
    //  'Lint and bundle script and style files',
    //  buildCommand
    //);

    this.cmd(
      'test',
      'Test script files',
      testCommand
    );

    this.emitter.emit('init', this);

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
   * @param   {string}    name
   * @param   {string}    description
   * @param   {function}  action
   * @returns {Runner}
   */
  cmd(name, description, action) {

    this.app.command(
      name,
      description,
      yargs => {

        const argv = yargs.argv;

        const args = getArgs(argv);
        const config = getConfig(args.debug ? 'development' : 'production');

        this.emitter.emit('cmd:enter', {name, args, config});
        Promise.resolve(action({args, config, emitter: this.emitter}))
          .then(
            () => this.emitter.emit('cmd:exit', {name, args, config, code: 0}),
            () => this.emitter.emit('cmd:exit', {name, args, config, code: -1})
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
    this.app.argv;//eslint-disable-line
    return this;
  }

}
