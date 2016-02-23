#!/usr/bin/env node
import chalk from 'chalk';
import Tradie from '../Tradie';

const tradie = new Tradie();

tradie
  .on('error', error => {
    console.error(chalk.red(error));
    process.exit(-1);
  })
  .on('cmd:exit', ({code}) => process.exit(code))
  .run()
;

