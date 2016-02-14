#!/usr/bin/env node
import program from 'commander';
import getArgs from '../lib/getArguments';
import getConfig from '../lib/getConfig';
import logger from '../lib/logger';
import styles from '../lib/styles';

program
  .description('Bundle scripts')
  .option('--production', 'optimise styles for a production environment')
  .option('-w, --watch', 're-build style bundles when they change')
  .option('-v, --verbose', 'verbosely list styles bundled')
  .parse(process.argv)
;

const args = getArgs(program);
const config = getConfig(args);
const buildLogger = logger(args);
const styleBuilder = styles(config.styles, args);

styleBuilder
  .on(
    'bundle:finish',
    args => buildLogger.styleBundleFinished(args)
  )
  .on(
    'bundles:finish',
    args => {
      buildLogger.styleBundlesFinished(args);
      if (args.error) {
        process.exit(-1);
      }
    }
  )
  .bundle()
    .catch(error => {
      console.log('ERROR!');
      buildLogger.error(error);
      process.exit(-1);
    })
;


//todo: handle errors and process.exit(-1) when not watching
//TODO: pass in name of bundle to only bundle a specific bundle