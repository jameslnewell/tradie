#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import args from '../lib/args';
const logger = require('../lib/logger');
import config from '../lib/config';
import scripts from '../lib/scripts';

program
  .description('Test scripts')
  .option('-w, --watch', 're-run tests when scripts change')
  .parse(process.argv)
;

const buildArgs = args(program);
const buildLogger = logger(buildArgs);
const scriptsBuilder = scripts(config.scripts, buildArgs);

scriptsBuilder
  .on('error', error => {
    buildLogger.error(error);
    process.exit(-1);
  })
  .on('test:error', () => {
    if (!buildArgs.watch) {
      process.exit(-1);
    }
  })
  .test()
;
