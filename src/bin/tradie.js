#!/usr/bin/env node
import sourceMapSupport from 'source-map-support';
import chalk from 'chalk';
import tradie from '../Tradie';

sourceMapSupport.install();

tradie()
  .then(code => process.exit(code))
  .catch(error => {
    console.error(chalk.red(error.stack));
    process.exit(-1);
  })
;

