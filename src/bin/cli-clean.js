#!/usr/bin/env node
'use strict';
const program = require('commander');
const chalk = require('chalk');
const config = require('../lib/config');
const scripts = require('../lib/scripts');
const cleanStyles = require('../lib/styles/clean');

program
  .description('Clean bundled scripts and styles')
  .parse(process.argv)
;

Promise.resolve()
  .then(scripts(config.scripts).clean())
  .then(cleanStyles(config.styles))
  .then(
    () => console.log(chalk.green(` => app cleaned`)),
    err => console.log(chalk.red(` => error: ${err}`))
  )
;