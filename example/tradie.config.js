
module.exports = {

  script: {
    bundles: ['./client.js', './server.js'],
    vendors: ['react', 'react-dom', 'react-redux', 'redux', 'redux-thunk'],
    extensions: ['.js', '.jsx']
  },

  plugins: [['copy', {files: ['index.html']}], 'serve', 'livereload']

};
