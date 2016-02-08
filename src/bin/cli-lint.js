#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import args from '../lib/args';
import config from '../lib/config';
import logger from '../lib/logger';
import scripts from '../lib/scripts';

program
  .description('Lint scripts')
  .parse(process.argv)
;

const buildArgs = args(program);
const buildLogger = logger(buildArgs);
const scriptBuilder = scripts(config.scripts, buildArgs);

scripts(config.scripts)
  .on('error', error => {
    console.log(chalk.red(error));
    process.exit(-1);
  })
  .on('lint:finish', result => {
    if (result.errors === 0) {
      console.log(chalk.green(' => app linted'));
    } else {
      console.log(chalk.red(' => app linted'));
      process.exit(-1);
    }
  })
  .lint()
;


//TODO: watching?