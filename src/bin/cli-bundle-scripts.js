#!/usr/bin/env node
import program from 'commander';
import args from '../lib/args';
import config from '../lib/config';
import logger from '../lib/logger';
import scripts from '../lib/scripts';

program
  .description('Bundle scripts')
  .option('--production', 'optimise scripts for a production environment')
  .option('-w, --watch', 're-build script bundles when they change')
  .option('-v, --verbose', 'verbosely list scripts bundled')
  .parse(process.argv)
;

const buildArgs = args(program);
const buildLogger = logger(buildArgs);
const scriptBuilder = scripts(config.scripts, buildArgs);

scriptBuilder
  .on(
    'error',
    error => {
      buildLogger.error(error);
      process.exit(-1);
    }
  )
  .on(
    'bundle:finish',
    args => buildLogger.scriptBundleFinished(args)
  )
  .on(
    'bundles:finish',
    args => buildLogger.scriptBundlesFinished(args)
  )
  .bundle()
;

//todo: handle errors and process.exit(-1) when not watching
//TODO: pass in name of bundle to only bundle a specific bundle