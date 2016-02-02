#!/usr/bin/env node
'use strict';
const program = require('commander');
const config = require('../lib/config').scripts;
const log = require('../lib/log');
const scripts = require('../lib/scripts');

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

let ok = true;
scripts(
  config,
  {
    watch,
    debug,
    onChange: function (files) {
      console.log(files);
    }
  }
)
  .on(
    'bundle:finish',
    args => log.scriptBundleFinished(ok, Object.assign({}, args, {verbose}))
  )
  .on(
    'bundles:finish',
    args => log.scriptBundlesFinished(ok, Object.assign({}, args, {verbose}))
  )
  .bundle()
;

//todo: handle errors and process.exit(-1) when not watching
//TODO: pass in name of bundle to only bundle a specific bundle