#!/usr/bin/env node
import program from 'commander';
import args from '../lib/args';
import config from '../lib/config';
import logger from '../lib/logger';
import scripts from '../lib/scripts';
import styles from '../lib/styles';

program
  .description('Bundle scripts and styles')
  .option('--production', 'build script and style bundles for a production environment')
  .option('-w, --watch', 're-build script and style bundles when they change')
  .option('-v, --verbose', 'verbosely list scripts and styles bundled')
  .parse(process.argv)
;

const buildArgs = args(program);
const buildLogger = logger(buildArgs);
const scriptBuilder = scripts(config.scripts, buildArgs);
const styleBuilder = styles(config.styles, buildArgs);

let scriptResult = null;
let styleResult = null;

Promise.all([
  scriptBuilder
    .on(
      'bundle:finish',
      result => buildLogger.scriptBundleFinished(result)
    )
    .on(
      'bundles:finish',
      result => scriptResult = result
    )
    .bundle(),
  styleBuilder
    .on(
      'bundle:finish',
      result => buildLogger.styleBundleFinished(result)
    )
    .on(
      'bundles:finish',
      result => styleResult = result
    )
    .bundle()
])
  .then(
    result => {
      buildLogger.scriptBundlesFinished(scriptResult);
      buildLogger.styleBundlesFinished(styleResult);
      if (scriptResult.error || styleResult.error) {
        process.exit(-1);
      }
    },
    error => {
      buildLogger.error(error);
      process.exit(-1);
    }
  )
;

