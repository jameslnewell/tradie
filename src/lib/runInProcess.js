import {spawn} from 'child_process';
import mapper from 'source-mapper';

export default function(bundle) {
  return new Promise((resolve, reject) => {
    let result = null;
    const contents = bundle.toString();

    //run in a sub-directory of `tradie` so that the `mocha` package is found
    //FIXME: should probably be run in the `.tradierc` directory
    //TODO: use command line so plugins can switch `mocha` for `mochify`, `istanbul cover` etc
    const node = spawn('node', {cwd: __dirname, stdio: [null, null, null, 'ipc']});

    node
      .on('error', reject)
      .on('exit', () => resolve(result))
      .on('message', data => {
        result = JSON.parse(data); //FIXME: this is a hack for `tradie-plugin-coverage`
      })
    ;

    //TODO: handle stream errors
    let stdout = node.stdout;
    let stderr = node.stderr;

    //if there is a source map, replace stack trace URLs from the generated bundle with the URLs from the original source file(s)
    const extracted = mapper.extract(contents);
    if (extracted.map) {

      //TODO: handle stream errors
      const stream1 = mapper.stream(extracted.map);
      stdout = stdout.pipe(stream1);
      const stream2 = mapper.stream(extracted.map);
      stderr = stderr.pipe(stream2);

    }

    //pipe test output to the console
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr); //TODO: colour it red

    //write the test bundle to node to start executing tests
    node.stdin.write(contents);
    node.stdin.end();

  });
}
