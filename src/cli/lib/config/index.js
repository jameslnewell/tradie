import path from 'path';
import {EventEmitter} from 'events';
import defaults from './defaults';
import readFromFile from './readFromFile';
import shallowMerge from './shallowMerge';

export default args => {
  const emitter = new EventEmitter();

  const baseConfig = {

    //merge the defaults
    ...defaults,

    //merge the cli arguments e.g. watch, optimize
    ...args,

    //set the root path
    root: process.cwd() //TODO: find the tradie.config.js file?

  };

  //read the user config from file
  return readFromFile(args)
    .then(userConfig => shallowMerge(baseConfig, userConfig))
    .then(config => ({
      ...config,

      //resolve paths
      root: path.resolve(config.root),
      src: path.resolve(config.root, config.src),
      dest: path.resolve(config.root, config.dest),
      tmp: path.resolve(config.root, config.tmp),

      //merge the plugin methods
      on: (...args) => emitter.on(...args),
      once: (...args) => emitter.once(...args),
      off: (...args) => emitter.off(...args),
      emit: (...args) => emitter.emit(...args)

    }))
  ;

};
