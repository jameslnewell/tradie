export default {

  src: './src/',
  dest: './dist/',
  tmp: './tmp',

  script: {
    bundles: ['./index.js'],
    vendors: [],
    extensions: ['.js'],
    outputFilename: null
  },

  style: {
    extensions: ['.css', '.scss'],
    outputFilename: null
  },

  asset: {
    extensions: [
      '.jpg', '.png', '.gif', '.svg',
      '.eot', '.ttf', '.woff', '.woff2'
    ],
    outputFilename: null
  },

  eslint: {},
  babel: {},

  plugins: [],

  //extra webpack config... try not to use this, it won't be portable if we switch tooling
  webpack: {}

};
