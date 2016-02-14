module.exports = function(config) {
  return Object.assign(
    {
      src: './src/',
      dest: './dist/',
      bundles: ['index.js'],
      libraries: [],
      transforms: [],
      extensions: ['js']
    },
    config
  );
};
