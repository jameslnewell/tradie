import pipe from 'promisepipe';
import fs from 'fs';
import uglify from '../uglify-stream';
import size from '../size-stream';

/**
 * Create a script bundle
 * @param {object}        [options]
 * @param {string}        [options.debug]
 * @param {string}        [options.src]       The source file
 * @param {string}        [options.dest]      The destination file
 * @param {EventEmitter}  [options.emitter]
 * @param {object}        [options.bundler]
 * @returns {object}      a piped stream
 */
export default function(options) {

  const debug = options.debug;
  const src = options.src;
  const dest = options.dest;
  const bundler = options.bundler;
  const emitter = options.emitter;

  const args = {src, dest};
  const startTime = Date.now();
  emitter.emit('scripts.bundle.started', args);

  //create bundle
  const streams = [bundler.bundle()];

  //optimise bundle
  if (!debug) {
    streams.push(uglify());
  }

  //write bundle
  streams.push(size(s => args.size = s));
  streams.push(fs.createWriteStream(dest));

  return pipe(...streams)
    .then(
      () => {
        args.time = Date.now() - startTime;
        emitter.emit('scripts.bundle.finished', args);
        return {error: null};
      },
      error => {
        args.time = Date.now() - startTime;
        args.error = error;
        emitter.emit('scripts.bundle.finished', args);
        return {error};
      }
    );
}
