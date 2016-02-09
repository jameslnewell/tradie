#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import args from '../lib/args';
import logger from '../lib/logger';
import config from '../lib/config';
import scripts from '../lib/scripts';

program
  .description('Lint scripts')
  .parse(process.argv)
;

const buildArgs = args(program);
const buildLogger = logger(buildArgs);
const scriptBuilder = scripts(config.scripts, buildArgs);

scriptBuilder
  .on('error', error => {
    buildLogger.error(error);
    process.exit(-1);
  })
  .on('lint:finish', result => {
    buildLogger.lintFinished(result);
    if (result.errors !== 0) {
      process.exit(-1);
    }
  })
  .lint()
;

//TODO: watching?