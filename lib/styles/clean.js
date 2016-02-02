'use strict';
const path = require('path');
const del = require('promised-del');

module.exports = function cleanScripts(config) {
  return del([
    path.join(config.dest, '*'),
    path.join(config.dest, '.*')
  ]);
};