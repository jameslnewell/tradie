#!/usr/bin/env node
import program from 'commander';
import getArgs from '../lib/getArguments';
import getConfig from '../lib/getConfig';
import logger from '../lib/logger';
import scripts from '../lib/scripts';

program
  .description('Bundle scripts')
  .option('--production', 'optimise scripts for a production environment')
  .option('-w, --watch', 're-build script bundles when they change')
  .option('-v, --verbose', 'verbosely list scripts bundled')
  .parse(process.argv)
;

const args = getArgs(program);
const config = getConfig(args);
const buildLogger = logger(args);
const scriptBuilder = scripts(config.scripts, args);

scriptBuilder
  .on(
    'bundle:finish',
    result => buildLogger.scriptBundleFinished(result)
  )
  .on(
    'bundles:finish',
    result => {
      buildLogger.scriptBundlesFinished(result);
      if (result.error) {
        process.exit(-1);
      }
    }
  )
  .bundle()
    .then(
      () => {/* do nothing */},
      error => {
        buildLogger.error(error);
        process.exit(-1);
      }
    )
;
