
export default {

  src: './src/',
  dest: './dist/',
  tmp: './tmp',

  scripts: {
    bundles: ['./index.js'],
    vendors: [],
    extensions: ['.js']
  },

  styles: {
    bundles: ['./index.css'],
    extensions: ['.scss', '.css']
  },

  plugins: [],

  //extra webpack config... try not to use this, it won't be portable if we switch tooling
  webpack: {},

  $: {
    test: {},
    optimise: {}
  }

};
