#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import mkdirp from 'mkdirp';
import config from '../lib/config';

program
  .description('Bundle scripts and styles')
  .option('--production', 'build script and style bundles for a production environment')
  .option('-w, --watch', 're-build script and style bundles when they change')
  .option('-v, --verbose', 'verbosely list scripts and styles bundled')
  .parse(process.argv)
;

require('./cli-bundle-scripts');
require('./cli-bundle-styles');