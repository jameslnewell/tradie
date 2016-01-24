#!/usr/bin/env node
'use strict';
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const config = require('../lib/config');
const bundleStyles = require('../lib/styles/bundle');
const bundleScripts = require('../lib/scripts/bundle');

program
  .description('Bundle scripts and styles')
  .option('-v, --verbose', 'log more information')
  .option('-w, --watch', 'watch script and style files for changes and re-build')
  .option('--production', 'build scripts and styles for a production environment')
  .parse(process.argv)
;

const watch = program.watch;
const debug = process.env.NODE_ENV !== 'production' && !program.production;

function logBundleError(type, args) {
  console.erorr(chalk.red(` => en error while occurred bundling ${type} ${path.basename(args.dest)}`))
}

function logBundleFinished(type, args) {
  console.log(chalk.blue(` => ${type} ${path.basename(args.dest)} bundled in ${args.time}s - ${args.size}B`))
}

function logBundlesFinished(type, args, ok) {
  if (ok) {
    console.log(chalk.green(` => ${type}s bundled in ${args.time}s - ${args.size}B`))
  } else {
    console.log(chalk.red(` => en error occurred while bundling ${type}s`))
  }
}

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

  let scriptsOk = true;
  bundleScripts(Object.assign({}, config.scripts, {
    watch: watch,
    debug: debug
  }))
    .on(
      'error',
      () => {
        scriptsOk = false;
        logBundleError('script', args);
      }
    )
    .on(
      'script:finish',
      args => logBundleFinished('script', args)
    )
    .on(
      'finish',
      args => logBundlesFinished('script', args, scriptsOk)
    )
  ;

});

//TODO: check bundle names - vendor.js and common.js are special and not allowed
//TODO: convert time and size into human readable e.g. 3000 into 3s
//TODO: pass in name of bundle to only bundle a specific bundle