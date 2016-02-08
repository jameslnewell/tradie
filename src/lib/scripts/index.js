import {EventEmitter} from 'events';
import defaults from './defaults';
import clean from './clean';
import lint from './lint';
import bundle from './bundle';
import test from './test';

module.exports = function scripts(config, options) {
  const emitter = new EventEmitter();
  const mergedConfig = defaults(config);
  const mergedOptions = Object.assign({debug: true, watch: false}, options);

  const src = mergedConfig.src;
  const dest = mergedConfig.dest;

  return {

    clean: () => clean(mergedConfig, mergedOptions, emitter),
    lint: () => lint(mergedConfig, mergedOptions, emitter),
    bundle: () => bundle(mergedConfig, mergedOptions, emitter),
    test: () => test(mergedConfig, mergedOptions, emitter),

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