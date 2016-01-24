#!/usr/bin/env node
'use strict';
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const config = require('../lib/config').scripts;
const log = require('../lib/log');
const bundleScripts = require('../lib/scripts/bundle');

program
  .description('Bundle scripts')
  .option('-v, --verbose', 'log more information')
  .option('-w, --watch', 'watch script and style files for changes and re-build')
  .option('--production', 'optimise scripts for a production environment')
  .parse(process.argv)
;

const watch = program.watch;
const debug = process.env.NODE_ENV !== 'production' && !program.production;

mkdirp(config.dest, err => {
  if (err) return console.log(chalk.red(` => error creating scripts output folder ${config.dest}`));

  let ok = true;
  bundleScripts(Object.assign({}, config, {
    watch: watch,
    debug: debug
  }))
    .on(
      'error',
      () => {
        ok = false;
        log.scriptBundleFinished(ok, args);
      }
    )
    .on(
      'script:finish',
      args => log.scriptBundleFinished(ok, args)
    )
    .on(
      'finish',
      args => log.scriptBundlesFinished(ok, args)
    )
  ;

});

//TODO: check bundle names - vendor.js and common.js are special and not allowed
//TODO: convert time and size into human readable e.g. 3000 into 3s
//TODO: pass in name of bundle to only bundle a specific bundle