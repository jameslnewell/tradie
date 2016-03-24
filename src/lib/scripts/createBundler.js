import path from 'path';
import insertGlobals from 'insert-module-globals';
import browserify from 'browserify';
import incremental from 'browserify-incremental';
import watchify from 'watchify';
import envify from 'envify';

/**
 * Create a script bundler
 * @param {object}        options
 * @param {boolean}       [options.test]        Whether this is for a test build
 * @param {boolean}       [options.debug]       Whether to bundle debug information
 * @param {boolean}       [options.watch]       Whether to watch files for changes
 * @param {string|array}  [options.src]         The source file(s)
 * @param {string}        [options.dest]        The output file
 * @param {array}         [options.transforms]  The transforms
 * @param {array}         [options.plugins]     The transforms
 * @param {array}         [options.extensions]  The extensions
 * @param {array}         [options.node]        Whether we should bundle for node instead of the browser
 */
export default function(options) {

  //const test = options.test || false;
  const debug = options.debug || false;
  const watch = options.watch || false;
  const src = options.src;
  const dest = options.dest;
  const transforms = options.transforms || [];
  const plugins = options.plugins || [];
  const extensions = options.extensions || ['js'];
  const node = options.node || false;

  let config = {
    debug,
    extensions: extensions.concat(['.json']),
    entries: src,
    transform: [],
    plugin: []
  };

  //configure for prod build
  if (!debug) {
    config.transform.push([envify, {global: true, NODE_ENV: 'production'}]);
  }

  //configure for watch build
  if (watch) {
    config.cache = {};
    config.packageCache = {};
    config.plugin.push(watchify);
  }

  //configure for node build
  if (node) {
    //--node === --bare --no-browser-field
    //--bare
    config.builtins = false; //--no-builtins
    config.commondir = false; //--no-commondir
    config.detectGlobals = false;
    config.insertGlobalVars = { //--insert-global-vars=__filename, __dirname
      __filename: insertGlobals.vars.__filename,
      __dirname: insertGlobals.vars.__dirname
    };
    //--no-browser-field
    config.browserField = false;
  }

  //configure for incremental build
  if (debug && dest && !node && !watch) { //FIXME: incremental breaks node and watch bundling for some reason - submit a bug/test!
    config = Object.assign({}, config, incremental.args);
    config.plugin.push([incremental, {cacheFile: path.join(path.dirname(dest), `.${path.basename(dest)}.cache`)}]);
  }

  //create the bundler
  const bundler = browserify(config);

  //configure transforms
  transforms.forEach(transform => {
    if (Array.isArray(transform)) {
      bundler.transform(...transform);
    } else {
      bundler.transform(transform);
    }
  });

  //configure plugins
  plugins.forEach(plugin => {
    if (Array.isArray(plugin)) {
      bundler.plugin(...plugin);
    } else {
      bundler.plugin(plugin);
    }
  });

  return bundler;
}
