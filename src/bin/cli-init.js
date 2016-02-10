#!/usr/bin/env node
import path from 'path';
import program from 'commander';
import chalk from 'chalk';
import args from '../lib/args';
import logger from '../lib/logger';
import config from '../lib/config';
import scripts from '../lib/scripts';
import styles from '../lib/styles';
import createFile from '../lib/createFile';
import createJsonFile from '../lib/createJsonFile';
import createDirectory from '../lib/createDirectory';

program
  .description('Create a new project')
  .option('-f, --force', 'force changes to be written to disk')
  .parse(process.argv)
;

if (!program.force) {
  console.log(chalk.yellow('Specify the --force flag if you wish to write files to disk. This action will not be reversable!'));
  process.exit(-1);
}

const buildArgs = args(program);
const buildLogger = logger(buildArgs);
const scriptBuilder = scripts(config.scripts, buildArgs);
const styleBuilder = styles(config.styles, buildArgs);

Promise.all([
  createIgnoreFile(config),
  createTradieConfig(),
  createPackageConfig(),
  scriptBuilder.init(),
  styleBuilder.init()
])
  .then(
    () => console.log(chalk.green(' => project created')),
    error => {
      buildLogger.error(error.stack);
      process.exit(-1);
    }
  )
;

function createIgnoreFile(config) {
  return createFile(
    '.gitignore',
    `${path.join(config.scripts.dest, '*')}\n${path.join(config.styles.dest, '*')}`
  );
}

function createTradieConfig() {
  const json = {};
  return createJsonFile('.tradierc', json);
}

function createPackageConfig() {

  const json = {
    name: path.basename(process.cwd()),
    private: true,
    devDependencies: {
      tradie: "^0.1.0"
    },
    scripts: {
      build: 'tradie build',
      test: 'tradie test'
    }
  };

  return createJsonFile('package.json', json);
}

//TODO: npm install