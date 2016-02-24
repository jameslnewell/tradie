import testScripts from '../lib/scripts/test';

export const name = 'test';
export const desc = 'Test script files';

export function hint(yargs) {
  return yargs.option('w', {
    alias: 'watch',
    default: false
  });
}

export function exec({args, config, emitter}) {
  return testScripts({args, config: config.scripts, emitter});
}
