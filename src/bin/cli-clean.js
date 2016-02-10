#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import config from '../lib/config';
import scripts from '../lib/scripts';
import styles from '../lib/styles';

program
  .description('Clean bundled scripts and styles')
  .parse(process.argv)
;

Promise.resolve()
  .then(scripts(config.scripts).clean())
  .then(styles(config.styles).clean())
  .then(
    () => {
      console.log(chalk.green(` => scripts cleaned`));
      console.log(chalk.green(` => styles cleaned`));
    },
    err => console.log(chalk.red(` => error: ${err}`))
  )
;