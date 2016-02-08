#!/usr/bin/env node
'use strict';
const program = require('commander');
const chalk = require('chalk');
const config = require('../lib/config');
const logger = require('../lib/logger');
const scripts = require('../lib/scripts');
const styles = require('../lib/styles');

program
  .description('Clean bundled scripts and styles')
  .option('--production', 'optimise script and style bundles for a production environment')
  .option('-w, --watch', 're-build script and styles bundles when they change')
  .option('-v, --verbose', 'verbosely list script and style bundles')
  .parse(process.argv)
;

const watch = program.watch || false;
const debug = process.env.NODE_ENV !== 'production' && !program.production;
const verbose = program.verbose || false;

const buildLogger = logger({verbose});
const scriptsBuilder = scripts(config.scripts, {watch, debug, verbose});
const stylesBuilder = styles(config.styles);

let failed = false;
scriptsBuilder.lint()
  .then(
    () => {

      Promise.all([

        scriptsBuilder
          .on('bundle:finish', buildLogger.scriptBundleFinished)
          .once('bundles:finish', buildLogger.scriptBundlesFinished)
          .bundle()
            .catch(() => failed = true)
        ,

        stylesBuilder
          .on('bundle:finish', buildLogger.styleBundleFinished)
          .once('bundles:finish', buildLogger.styleBundlesFinished)
          .bundle()
            .catch(() => failed = true)

      ])
        .then(() => {
          console.log('finished all');
          if (failed && !watch) {
            process.exit(-1);
          }
        })
      ;

    },
    () => {
      log.error(' => lint errors found');
      process.exit(-1);
    }
  )
;

//todo: handle errors and process.exit(-1) when not watching
//TODO: pass in name of bundle to only bundle a specific bundle