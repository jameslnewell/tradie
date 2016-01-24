#!/usr/bin/env node
'use strict';
const program = require('commander');
const chalk = require('chalk');
const config = require('../lib/config');
const cleanStyles = require('../lib/styles/clean');
const cleanScripts = require('../lib/scripts/clean');

program
  .description('Clean bundled scripts and styles')
  .option('-v, --verbose', 'verbosely list scripts and styles bundled')
  .parse(process.argv)
;


require('./cli-lint');
require('./cli-bundle');