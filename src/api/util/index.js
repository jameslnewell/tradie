
const deepMerge = require('./deepMerge');
const shallowMerge = require('./shallowMerge');

const extendDefaultConfig = require('./extendDefaultConfig');

const isClientBundle = require('./isClientBundle');
const getClientBundles = require('./getClientBundles');
const isServerBundle = require('./isServerBundle');
const getServerBundles = require('./getServerBundles');

const isScriptFile = require('./../isScriptFile');
const isTestScriptFile = require('./../isTestScriptFile');

module.exports = {

  deepMerge,
  shallowMerge,
  extendDefaultConfig,

  isClientBundle,
  getClientBundles,
  isServerBundle,
  getServerBundles,

  isScriptFile,
  isTestScriptFile

};
