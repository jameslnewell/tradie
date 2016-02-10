#!/usr/bin/env node
import program from 'commander';
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

program
  .command('init', 'create a new project')
  .command('clean', 'clean scripts and styles')
  .command('lint', 'lint scripts and styles')
  .command('bundle-scripts', 'bundle scripts')
  .command('bundle-styles', 'bundle styles')
  .command('bundle', 'bundle scripts and styles')
  .command('build', 'lint and bundle scripts and styles')
  .command('test', 'test scripts')
  .parse(process.argv)
;
