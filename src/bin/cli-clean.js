#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import config from '../lib/config';
import scripts from '../lib/scripts';
import cleanStyles from '../lib/styles/clean';

program
  .description('Clean bundled scripts and styles')
  .parse(process.argv)
;

Promise.resolve()
  .then(scripts(config.scripts).clean())
  .then(cleanStyles(config.styles))
  .then(
    () => console.log(chalk.green(` => app cleaned`)),
    err => console.log(chalk.red(` => error: ${err}`))
  )
;