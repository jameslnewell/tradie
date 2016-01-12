'use strict';
const path = require('path');
const del = require('promised-del');
const defaults = require('./defaults');

module.exports = function cleanScripts(config) {
  const mergedConfig = defaults(config);
  return del([
    path.join(mergedConfig.dest, '*'),
    path.join(mergedConfig.dest, '.*')
  ]);
};