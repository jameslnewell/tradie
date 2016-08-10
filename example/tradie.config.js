const copy = require('tradie-plugin-copy').default;
const serve = require('tradie-plugin-serve').default;
const livereload = require('tradie-plugin-livereload').default;

module.exports = {

  script: {
    bundles: ['./client.js', './server.js'],
    vendors: ['react', 'react-dom', 'react-redux', 'redux', 'redux-thunk'],
    extensions: ['.js', '.jsx']
  },
  
  eslint: {
    extends: 'jameslnewell/react'
  },

  babel: {
    presets: ['es2015', 'react'],
    plugins: ['transform-object-rest-spread', 'transform-class-properties']
  },

  plugins: [
    // copy({files: ['index.html']}),
    // serve(),
    // livereload()
  ]

};
