#!/usr/bin/env node
'use strict';
const program = require('commander');
const chalk = require('chalk');
const config = require('../lib/config');

program
  .description('Lint scripts')
  .parse(process.argv)
;
