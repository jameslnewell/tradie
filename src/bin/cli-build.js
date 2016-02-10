#!/usr/bin/env node
import program from 'commander';
import args from '../lib/args';
import config from '../lib/config';
import logger from '../lib/logger';
import scripts from '../lib/scripts';
import styles from '../lib/styles';

program
  .description('Clean bundled scripts and styles')
  .option('--production', 'optimise script and style bundles for a production environment')
  .option('-w, --watch', 're-build script and styles bundles when they change')
  .option('-v, --verbose', 'verbosely list script and style bundles')
  .parse(process.argv)
;

const buildArgs = args(program);
const buildLogger = logger(buildArgs);
const scriptBuilder = scripts(config.scripts, buildArgs);
const styleBuilder = styles(config.styles, buildArgs);

scriptBuilder
  .on('error', error => {
    buildLogger.error(error);
    process.exit(-1);
  })
  .on('lint:finish', result => {
    if (result.errors !== 0) {
      process.exit(-1);
    }
  })
  .lint()
    .then(
      () => {

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

      },
      () => {
        log.error(' => lint errors found');
        process.exit(-1);
      }
    )
;
