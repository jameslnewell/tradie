#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import getArgs from '../lib/getArguments';
import getConfig from '../lib/getConfig';
import logger from '../lib/logger';
import scripts from '../lib/scripts';

program
  .description('Lint scripts')
  .parse(process.argv)
;

const args = getArgs(program);
const config = getConfig(args);
const buildLogger = logger(args);
const scriptBuilder = scripts(config.scripts, args);

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