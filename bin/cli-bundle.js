#!/usr/bin/env node
'use strict';
const rc = require('rc');
const program = require('commander');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const bundleStyles = require('../lib/styles/bundle');
const bundleScripts = require('../lib/scripts/bundle');

program
  .description('Bundle scripts and styles')
  .option('-w, --watch', 'watch script and style files for changes and re-build')
  .option('--production', 'build scripts and styles for a production environment')
  .parse(process.argv)
;

const config = rc('buildtool', {
  styles: {},
  scripts: {}
});

const watch = program.watch;
const debug = process.env.NODE_ENV !== 'production' && !program.production;

mkdirp('dist/', err => {
  if (err) return console.log(chalk.red(` => error: ${err}`));

  const bundleStartTime = Date.now();

  const styles = bundleStyles(config.styles, {
      watch: watch,
      debug: debug
    })
    .then(
      () => {
        const styleTotalTime = (Date.now() - bundleStartTime) / 1000;
        console.log(chalk.green(` => styles bundled in ${styleTotalTime}s`)); //TODO: --verbose should show individual times and maybe filesizes too
      },
      err => {
        console.log(chalk.red(` => error: ${err}`));
      }
    )
  ;

  const scripts = bundleScripts(config.scripts, {
    watch: watch,
    debug: debug
  })
    .then(
      () => {
        const scriptTotalTime = (Date.now() - bundleStartTime) / 1000;
        console.log(chalk.green(` => scripts bundled in ${scriptTotalTime}s`)); //TODO: --verbose should show individual times and maybe filesizes too
      },
      err => {
        console.log(chalk.red(` => error: ${err}`));
      }
    )
  ;

  return Promise.all([styles, scripts]);

});