module.exports = function(config) {
  return Object.assign(
    {
      src: 'src/',
      dest: 'dist/',
      bundle: ['index.js'],
      vendor: [],
      transform: []
    },
    config
  );
};