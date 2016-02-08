module.exports = function(config) {
  return Object.assign(
    {
      src: 'src/',
      dest: 'dist/',
      bundle: ['index.scss'],
      vendor: []
    },
    config
  );
};