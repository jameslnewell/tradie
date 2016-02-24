#!/usr/bin/env node
import chalk from 'chalk';
import sourceMapSupport from 'source-map-support';
import Tradie from '../Tradie';

sourceMapSupport.install();

const tradie = new Tradie();

tradie
  .on('error', error => {
    console.error(chalk.red(error.stack));
    process.exit(-1);
  })
  .on('command.finished', ({code}) => process.exit(code))
  .run()
;

