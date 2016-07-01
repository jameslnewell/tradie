
module.exports = {

  scripts: {
    bundles: ['./client.js', './server.js'],
    vendors: ['react', 'react-dom', 'react-redux', 'redux', 'redux-thunk'],
    extensions: ['.js', '.jsx']
  },

  styles: {
    bundles: ['./client.scss']
  },

  plugins: [['copy', {files: ['index.html']}], 'serve', 'livereload', 'coverage']

};
