import path from 'path';
import chalk from 'chalk';
import humanize from 'humanize-duration';
import filesize from 'file-size';

const formatTime = time => {
  if (isNaN(time)) {
    return '?';
  } else {
    return humanize(time);
  }
};

const formatSize = size => filesize(size).human('jedec').replace('Bytes', 'B');

const getMessageColor = (color, errors, warnings) => {
  let result = color;
  if (errors.length) {
    result = 'red';
  } else if (warnings.length) {
    result = 'yellow';
  }
  return result;
};

const printMessages = (errors, warnings) => {
  if (errors.length) {
    errors.forEach(error => console.error(error));
  } else if (warnings.length) {
    warnings.forEach(warning => console.error(warning));
  }
};

/**
 * Methods for collecting and reporting on stats across multiple webpack compilations
 * @param   {object} options
 * @returns {{hasErrors: (function(): boolean), hasWarnings: (function(): boolean), collect: (function(*, *)), summarize: (function())}}
 */
export default options => {

  const errors = false;
  const warnings = false;

  const totals = {
    script: {
      time: {},
      size: 0,
      count: 0
    },
    style: {
      time: {},
      size: 0,
      count: 0
    },
  };

  const hasErrors = () => errors.length > 0;
  const hasWarnings = () => warnings.length > 0;

  /**
   * Collect stats from a compilation
   * @param {string} name   The compilation name
   * @param {object} stats  The compilation stats
   */
  const collect = (name, stats) => {

    const json = stats.toJson({
      // context: true, //broken in webpack2?
      hash: false,
      version: false,
      timings: true,
      assets: true,
      chunks: false,
      chunkModules: false,
      modules: false,
      children: false,
      cached: false,
      reasons: false,
      source: false,
      errorDetails: false,
      chunkOrigins: false
    });

    //batch up the messages
    if (json.errors.length) {
      errors.concat(json.errors);
    }
    if (json.warnings.length) {
      warnings.concat(json.errors);
    }

    //workout what color notifications should be
    let color = getMessageColor('blue', json.errors, json.warnings);

    //process asset information
    json.assets.forEach(asset => {

      //scripts
      if (/\.js$/.test(asset.name)) {

        //update totals
        totals.script.time.foo = json.time;
        totals.script.size += asset.size;
        totals.script.count++;

        //notify user
        console.log(chalk[color](` => script ${chalk.underline(asset.name)} bundled in ${formatTime(json.time)} seconds - ${formatSize(asset.size)}`));

        //notify plugins
        options.emit('scripts.bundle.finished', {
          ...asset,
          src: path.join(options.src, asset.name),
          dest: path.join(options.dest, asset.name),
        });

      }

      //styles
      if (/\.css$/.test(asset.name)) {

        //update totals
        totals.style.time.foo = json.time;
        totals.style.size += asset.size;
        totals.style.count++;

        //notify user
        console.log(chalk[color](` => style ${chalk.underline(asset.name)} bundled in ${formatTime(json.time)} seconds - ${formatSize(asset.size)}`))

        //notify plugins
        options.emit('styles.bundle.finished', {
          ...asset,
          src: path.join(options.src, asset.name),
          dest: path.join(options.dest, asset.name),
        });

      }

    });

    //when watching, print compilation messages immediately, because the other compilations may not be triggered and the messages would never be displayed if we batched them
    if (options.watch) {
      printMessages(json.errors, json.warnings);
    }

  };

  const summarize = () => {

    //workout what color notifications should be
    let color = getMessageColor('green', errors, warnings);

    //notify user
    console.log(chalk[color](` => ${totals.script.count} scripts bundled in ${formatTime(totals.script.time)} @ ${formatSize(totals.script.size)}`));
    console.log(chalk[color](` => ${totals.style.count} styles bundled in ${formatTime(totals.script.time)} @ ${formatSize(totals.script.size)}`));

    //when not watching, print all compilation messages at the same time, so the asset+summary information is displayed together
    if (!options.watch) {
      printMessages(errors, warnings);
    }

  };

  return {
    hasErrors,
    hasWarnings,
    collect,
    summarize
  }
};
