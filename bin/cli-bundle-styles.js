#!/usr/bin/env node
'use strict';
const program = require('commander');
const config = require('../lib/config').styles;
const log = require('../lib/log');
const bundleStyles = require('../lib/styles/bundle');

program
  .description('Bundle scripts')
  .option('--production', 'optimise styles for a production environment')
  .option('-w, --watch', 're-build style bundles when they change')
  .option('-v, --verbose', 'verbosely list styles bundled')
  .parse(process.argv)
;

const watch = program.watch || false;
const debug = process.env.NODE_ENV !== 'production' && !program.production;
const verbose = program.verbose || false;

let ok = true;
const styles = bundleStyles(config, {
  watch,
  debug
})
  .on(
    'error',
    () => {
      ok = false;
      log.styleBundleFinished(ok, {verbose});
    }
  )
  .on(
    'style:finish',
    args => log.styleBundleFinished(ok, Object.assign({}, args, {verbose}))
  )
  .on(
    'finish',
    args => log.styleBundlesFinished(ok, Object.assign({}, args, {verbose}))
  )
;


//todo: handle errors and process.exit(-1) when not watching
//TODO: pass in name of bundle to only bundle a specific bundle