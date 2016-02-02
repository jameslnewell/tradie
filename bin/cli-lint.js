#!/usr/bin/env node
'use strict';
const program = require('commander');
const chalk = require('chalk');
const log = require('../lib/log');
const config = require('../lib/config').scripts;
const scripts = require('../lib/scripts');

program
  .description('Lint scripts')
  .parse(process.argv)
;

scripts(config.src).lint()
  .then(
    () => console.log(chalk.green(' => app linted')),
    err => {
      console.log(chalk.red(' => app linted'));
      process.exit(-1)
    }
  )
;


//TODO: watching