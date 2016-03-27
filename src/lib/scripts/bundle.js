import createWebpackConfig from './createWebpackConfig';
import runWebpack from './runWebpack';

/**
 * Create script bundles
 *
 * @param {object}        config
 * @param {string}        [config.src]       The source directory
 * @param {string}        [config.dest]      The destination directory
 * @param {array}         [config.bundles]
 * @param {array}         [config.vendor]
 * @param {array}         [config.loaders]
 * @param {array}         [config.plugins]
 * @param {array}         [config.extensions]
 *
 * @param {object}        args
 * @param {string}        [args.env]
 * @param {string}        [args.watch]
 *
 * @param {function}      emitter
 * @param {function}      onChange
 */
export default function({args, config, emitter, onChange}) {

  const debug = args.env !== 'production';
  const watch = args.watch;
  const src = config.src;
  const dest = config.dest;
  const bundles = config.bundles;
  const libraries = config.libraries;
  const transforms = config.transforms;
  const plugins = config.plugins;
  const extensions = config.extensions;

  const webpackConfig = createWebpackConfig(
    {root: '.', env: args.env, config: {scripts: config}},
    {}
  );
  return runWebpack(webpackConfig, {watch, afterCompile: (err, stats, fs) => console.log('compiled', err, stats, fs)});

}

//TODO: check bundle names - vendor.js and common.js are special and not allowed
