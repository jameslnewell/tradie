#!/usr/bin/env node
'use strict';
const program = require('commander');
const chalk = require('chalk');
const config = require('../lib/config');
const cleanStyles = require('../lib/styles/clean');
const cleanScripts = require('../lib/scripts/clean');

program
  .description('Clean bundled scripts and styles')
  .parse(process.argv)
;

Promise.resolve()
  .then(cleanStyles(config))
  .then(cleanScripts(config))
  .then(
    () => console.log(chalk.green(` => app built`)),
    err => console.log(chalk.red(` => error: ${err}`))
  )
;