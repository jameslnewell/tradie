#!/usr/bin/env node
import 'source-map-support/register';
import chalk from 'chalk';
import commander from 'commander';
import metadata from '../../package.json';
import getConfig from './lib/config';

const action = function() { //eslint-disable-line func-style
  const cmdName = this.name(); //eslint-disable-line no-invalid-this
  const cmdOpts = this.opts(); //eslint-disable-line no-invalid-this

  //load the default config
  getConfig({...cmdOpts, cmd: cmdName})

    //init the plugins

    //load and run the command
    .then(config => {

      //load the command
      const command = require(`../api/command/${cmdName}`).default; //eslint-disable-line global-require

      //run the command
      return Promise.resolve(command(config));

    })

    //exit with errors
    .catch(error => {
      if (error) {
        if (error instanceof Error) {
          console.error(chalk.red(error.stack));
        } else {
          console.error(chalk.red(error));
        }
      }
      process.exit(1);
    })

  ;

};

commander
  .version(metadata.version)
  .usage('[command] [options]')
  .description('A semi-opinionated build tool for frontend projects.')
;

commander
  .command('clean')
  .description('remove bundled script, style and asset files')
  .action(action)
;

commander
  .command('lint')
  .description('lint script files')
  .action(action)
;

commander
  .command('build')
  .description('bundle script, style and asset files')
  .option('--watch', 're-bundle script, style and asset files whenever they change', false)
  .option('--optimize', 'optimize script, style and asset files, including minification, dead-code removal, file hashing etc', false)
  .action(action)
;

commander
  .command('test')
  .description('test script files')
  .option('--watch', 're-test script files whenever they change', false)
  .action(action)
;

commander
  .command('*', '', {noHelp: true})
  .action(() => {
    commander.outputHelp();
    process.exit(1);
  })
;

commander.parse(process.argv);

//show help if no command is provided
if (!process.argv.slice(2).length) {
  commander.outputHelp();
  process.exit(1);
}

