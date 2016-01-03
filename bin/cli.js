#!/usr/bin/env node
'use strict';
const program = require('commander');

program
  .command('lint', 'lint scripts and styles')
  .command('bundle', 'bundle scripts and styles')
  .command('test', 'test scripts and styles')
  .parse(process.argv)
;
