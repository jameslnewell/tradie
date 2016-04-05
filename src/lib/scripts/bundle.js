import path from 'path';
import {createClientConfig, createServerConfig} from './createWebpackConfig';
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
 */
export default function(tradie) {
  const {env, args: {watch}, config: {src, dest}, onChange} = tradie;

  //TODO: check for server.js and run a server build too

  function afterCompile(err, stats) {

    if (err) {
      //FIXME:
      console.log(err);
      console.log(stats);
      return;
    }

    //emit synthetic (cause webpack) end of bundling events for script bundles

    let scriptCount = 0;
    let scriptTotalSize = 0;
    stats.assets
      .filter(asset => path.extname(asset.name) === '.js')
      .forEach(asset => {

        scriptCount += 1;
        scriptTotalSize += asset.size;

        tradie.emit('scripts.bundle.finished', {
          src: path.join(src, asset.name),
          dest: path.join(dest, asset.name),
          size: asset.size
        });

      })
    ;

    tradie.emit('scripts.bundling.finished', {
      src,
      dest,
      count: scriptCount,
      time: stats.time,
      size: scriptTotalSize,
      errors: stats.errors
    });

  }

  function bundleForClient() {

    const webpackConfig = createClientConfig(
      {...tradie, onChange}
    );

    return runWebpack(webpackConfig, {watch}, afterCompile);

  }

  function bundleForServer() {

    const webpackConfig = createServerConfig(
      {...tradie, onChange}
    );

    return runWebpack(webpackConfig, {watch}, afterCompile);

  }

  const promises = [bundleForClient()];

  return Promise.all(promises);
}
