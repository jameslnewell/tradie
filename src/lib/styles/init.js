import path from 'path';
import createFile from '../createFile';
import createDirectory from '../createDirectory';

function createSourceDirectory(config) {
  return createDirectory(config.src);
}

function createStyleFile(config) {
  return createFile(path.join(config.src, 'index.scss'));
}

export default function(config, options, emitter) {
  return createSourceDirectory(config)
    .then(() => createStyleFile(config))
  ;
};
