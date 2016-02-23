import path from 'path';
import del from 'promised-del';

/**
 * Clean the scripts directory
 * @param   {string} dir
 * @param   {object} emitter
 * @returns {Promise}
 */
export default function(dir, emitter) {

  emitter.emit('styles:clean:started');
  return del([
    path.join(dir, '*'),
    path.join(dir, '.*')
  ]).then(
    () => emitter.emit('styles:clean:finished'),
    error => emitter.emit('error', error)
  );

}
