//LinearPromisePipeline

export function pipe(stages, input) {
  return stages.reduce((prev, next) => prev.then(next), Promise.resolve(input));
}

export function mixin(object = {}) {

  object.__handlers = {};

  object.on = function(event, handler) {

    if (!this.__handlers[event]) {
      this.__handlers[event] = [];
    }

    //TODO: check its not already there?
    this.__handlers[event].push(handler);

    return this;
  };

  object.once = function(event, handler) {
    let handled = false;
    return this.on(event, (...args) => {
      if (!handled) {
        handle(...args);
      }
      handled = true;
    });
  };

  object.off = function(event, handler) {

    if (this.__handlers[event]) {
      const index = this.__handlers[event].findIndex(h => h === handler);
      //TODO: remove it
      //this.__handlers[event].slice(index);
    }

    return this;
  };

  object.emit = function(event, input) {

    if (!this.__handlers[event]) {
      return Promise.resolve(input);
    }

    return pipe(this.__handlers[event], input);
  };

  return object;
}

