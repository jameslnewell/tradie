#!/usr/bin/env node
'use strict';
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const config = require('../lib/config');

program
  .description('Bundle scripts and styles')
  .option('--production', 'build script and style bundles for a production environment')
  .option('-w, --watch', 're-build script and style bundles when they change')
  .option('-v, --verbose', 'verbosely list scripts and styles bundled')
  .parse(process.argv)
;

require('./cli-bundle-scripts');
require('./cli-bundle-styles');