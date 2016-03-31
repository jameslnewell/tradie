
export default class WatchAndLintPlugin {

  constructor(onChange) {
    this.onChange = onChange;
  }

  apply(compiler) {

    compiler.plugin('invalid', (file) => {
      console.log('changed:', file);
      this.onChange(file);
    });

  }
}
