#!/usr/bin/env node
'use strict';
const program = require('commander');
const chalk = require('chalk');
const config = require('../lib/config');
const scripts = require('../lib/scripts');

program
  .description('Test scripts')
  .parse(process.argv)
;

const watch = program.watch || false;

const scriptsBuilder = scripts(config.scripts, {watch});

scriptsBuilder
  .on('test:error', error => {
    if (error) {
      console.error(chalk.red(error));
    }
    process.exit(-1);
  })
  .test()
;
