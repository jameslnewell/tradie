module.exports = function(config) {
  return Object.assign(
    {
      src: 'src/',
      dest: 'dist/',
      bundles: ['index.scss'],
      libraries: []
    },
    config
  );
};