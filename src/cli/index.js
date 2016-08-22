#!/usr/bin/env node
import 'source-map-support/register';
import chalk from 'chalk';
import commander from 'commander';
import metadata from '../../package.json';
import getConfig from './lib/config';
import createExcludeFileFilter from './lib/createExcludeFileFilter';

const createAction = function() { //eslint-disable-line func-style
  const command = this.name(); //eslint-disable-line no-invalid-this
  const options = this.opts(); //eslint-disable-line no-invalid-this

  runAction({
    command,
    ...options
  });

};

const createActionWithGlobs = function(globs) { //eslint-disable-line func-style
  const command = this.name(); //eslint-disable-line no-invalid-this
  const options = this.opts(); //eslint-disable-line no-invalid-this

  runAction({
    command,
    exclude: createExcludeFileFilter(globs),
    ...options
  });

};

const runAction = options => { //eslint-disable-line func-style

  //load the default config
  getConfig(options)

    //load and run the command
    .then(config => {

      //init the plugins
      config.plugins.forEach(plugin => plugin(config));

      //load the command
      const command = require(`../api/command/${options.command}`).default; //eslint-disable-line global-require

      //run the command
      return Promise.resolve(command(config))
        .then(() => config.emit('exit'))
      ;
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
  .action(createAction)
;

commander
  .command('lint [files...]')
  .description('lint script files')
  .action(createActionWithGlobs)
;

commander
  .command('build')
  .description('bundle script, style and asset files')
  .option('--watch', 're-bundle script, style and asset files whenever they change', false)
  .option('--optimize', 'optimize script, style and asset files, including minification, dead-code removal, file hashing etc', false)
  .action(createAction)
;

commander
  .command('test [files...]')
  .description('test script files')
  .option('--watch', 're-test script files whenever they change', false)
  .action(createActionWithGlobs)
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

