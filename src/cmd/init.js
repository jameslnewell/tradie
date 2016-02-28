import path from 'path';
import chalk from 'chalk';
import memFs from 'mem-fs';
import memFsEditor from 'mem-fs-editor';
import defaultTemplate from '../lib/defaultTemplate';
import requireExtension from '../lib/requireExtension';

export const name = 'init';
export const desc = 'Create a new project';

export function hint(yargs) {
  return yargs
    .option('f', {
      alias: 'force',
      default: false
    })
    .option('t', {
      alias: 'template',
      default: null
    })
  ;
}

function executeTemplate(fn, config) {

  const store = memFs.create();
  const fs = memFsEditor.create(store);

  return Promise.resolve(fn(fs, config))
    .then(() => new Promise((resolve, reject) => fs.commit(() => resolve()))) //FIXME: mem-fs-editor callback doesn't handle errors??
    .then(() => console.log(chalk.green(' => project created')))
  ;

  //TODO: someway for template to merge config with default package.json, .tradierc etc and not have to define all the fields

}

export function exec({args, config}) {
  let {template} = args;

  if (!args.force) {
    console.log(chalk.yellow('Specify the --force flag if you wish to write files to disk. This action will not be reversable!'));
    //TODO: check no files exist already
    return -1;
  }

  if (template === null) {
    return executeTemplate(defaultTemplate, config);
  } else {
    return requireExtension(template, 'template')
      .then((templateFn => executeTemplate(templateFn, config)))
    ;
  }

}
