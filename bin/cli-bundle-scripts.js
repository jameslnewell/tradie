#!/usr/bin/env node
'use strict';
const program = require('commander');
const mkdirp = require('mkdirp');
const config = require('../lib/config').scripts;
const log = require('../lib/log');
const bundleScripts = require('../lib/scripts/bundle');

program
  .description('Bundle scripts')
  .option('--production', 'optimise scripts for a production environment')
  .option('-w, --watch', 're-build script bundles when they change')
  .option('-v, --verbose', 'verbosely list scripts bundled')
  .parse(process.argv)
;

const watch = program.watch || false;
const debug = process.env.NODE_ENV !== 'production' && !program.production;
const verbose = program.verbose || false;

mkdirp(config.dest, err => {

  if (err) {
    log.error(` => error creating scripts destination directory ${config.dest}`);
    return;
  }

  let ok = true;
  bundleScripts(Object.assign({}, config, {
    watch,
    debug
  }))
    .on(
      'error',
      () => {
        ok = false;
        log.scriptBundleFinished(ok, {verbose});
      }
    )
    .on(
      'script:finish',
      args => log.scriptBundleFinished(ok, Object.assign({}, args, {verbose}))
    )
    .on(
      'finish',
      args => log.scriptBundlesFinished(ok, Object.assign({}, args, {verbose}))
    )
  ;

});

//todo: handle errors and process.exit(-1) when not watching
//TODO: check bundle names - vendor.js and common.js are special and not allowed
//TODO: pass in name of bundle to only bundle a specific bundle