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
    extensions: [
      '.jpg', '.png', '.gif', '.svg',
      '.eot', '.ttf', '.woff', '.woff2'
    ]
  },

  eslint: {},
  babel: {},

  plugins: [],

  //extra webpack config... try not to use this, it won't be portable if we switch tooling
  webpack: {}

};

module.exports = (config) => {
  return shallowMerge(defaultConfig, config || {});
};
