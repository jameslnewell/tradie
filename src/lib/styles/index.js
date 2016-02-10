import {EventEmitter} from 'events';
import defaults from './defaults';
import init  from './init';
import clean from './clean';
import bundle from './bundle';

module.exports = function styles(config, options) {
  const emitter = new EventEmitter();
  const mergedConfig = defaults(config);
  const mergedOptions = Object.assign({debug: true, watch: false, verbose: false}, options);

  const src = mergedConfig.src;
  const dest = mergedConfig.dest;

  return {

    init: () => init(mergedConfig, mergedOptions, emitter),
    clean: () => clean(mergedConfig, mergedOptions, emitter),
    bundle: () => bundle(mergedConfig, mergedOptions, emitter),

    on: function(event, handler) {
      emitter.on(event, handler);
      return this;
    },

    once: function(event, handler) {
      emitter.on(event, handler);
      return this;
    }

  };

};

module.exports();