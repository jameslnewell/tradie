import path from 'path';
import del from 'promised-del';

/**
 * Clean up files in the styles `dest` directory
 * @param   {string}        directory
 * @param   {EventEmitter}  emitter
 * @returns {Promise}
 */
export default function(directory, emitter) {
  return del([
    path.join(directory, '*'),
    path.join(directory, '.*')
  ])
    .then(() => emitter.emit('styles.cleaning.finished'))
  ;
}
