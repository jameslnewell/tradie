#!/usr/bin/env node
import program from 'commander';
import args from '../lib/args';
import config from '../lib/config';
import logger from '../lib/logger';
import styles from '../lib/styles';

program
  .description('Bundle scripts')
  .option('--production', 'optimise styles for a production environment')
  .option('-w, --watch', 're-build style bundles when they change')
  .option('-v, --verbose', 'verbosely list styles bundled')
  .parse(process.argv)
;

const buildArgs = args(program);
const buildLogger = logger(buildArgs);
const styleBuilder = styles(config.styles, buildArgs);

styleBuilder
  .on(
    'error',
    error => {
      buildLogger.error(error);
      process.exit(-1);
    }
  )
  .on(
    'style:finish',
    args => buildLogger.styleBundleFinished(args)
  )
  .on(
    'bundles:finish',
    args => buildLogger.styleBundlesFinished(args)
  )
  .bundle()
;


//todo: handle errors and process.exit(-1) when not watching
//TODO: pass in name of bundle to only bundle a specific bundle