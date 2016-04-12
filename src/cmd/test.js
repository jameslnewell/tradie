import mergewith from 'lodash.mergewith';
import concatWithPrevArray from '../util/concatWithPrevArray';
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
  const finalConfig = mergewith({}, config.scripts, config.tests, concatWithPrevArray);
  return testScripts({args, config: finalConfig, emitter});
}
