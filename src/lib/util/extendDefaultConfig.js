const shallowMerge = require('./shallowMerge');

const defaultConfig = {

  src: './src/',
  dest: './dist/',
  tmp: './tmp',

  script: {
    bundles: ['./index.js'],
    vendors: [],
    extensions: ['.js']
  },

  style: {
    extensions: ['.css', '.scss']
  },

  asset: {
    extensions: ['.jpeg', '.jpg', '.gif', '.png', '.svg', '.woff', '.ttf', '.eot']
  },

  plugins: [],

  //extra webpack config... try not to use this, it won't be portable if we switch tooling
  webpack: {}

};

module.exports = (config) => {
  return shallowMerge(defaultConfig, config || {});
};
