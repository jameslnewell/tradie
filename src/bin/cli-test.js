#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import config from '../lib/config';
import scripts from '../lib/scripts';

program
  .description('Test scripts')
  .option('-w, --watch', 're-build script bundles when they change')
  .parse(process.argv)
;

const watch = program.watch || false;

const scriptsBuilder = scripts(config.scripts, {watch});

scriptsBuilder
  .on('error', error => {
    console.error(chalk.red(error));
    process.exit(-1);
  })
  .on('test:error', error => {
    if (!watch) {
      process.exit(-1);
    }
  })
  .test()
;
