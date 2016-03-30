import lint from './lint';

export default class WatchAndLintPlugin {
  apply(compiler) {

    compiler.plugin('invalid', (file) => {
      console.log('changed:', file);
      lint(file);
    });

  }
}
