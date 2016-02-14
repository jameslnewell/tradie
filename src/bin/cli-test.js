#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import getArgs from '../lib/getArguments';
import getConfig from '../lib/getConfig';
import logger from '../lib/logger';
import scripts from '../lib/scripts';

program
  .description('Test scripts')
  .option('-w, --watch', 're-run tests when scripts change')
  .parse(process.argv)
;

const args = getArgs(program);
const config = getConfig(args);
const buildLogger = logger(args);
const scriptsBuilder = scripts(config.scripts, args);

scriptsBuilder
  .on('error', error => {
    buildLogger.error(error);
    process.exit(-1);
  })
  .on('test:error', () => {
    if (!args.watch) {
      process.exit(-1);
    }
  })
  .test()
;
