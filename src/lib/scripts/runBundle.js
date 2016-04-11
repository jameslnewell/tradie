import {spawn} from 'child_process';
import mapper from 'source-mapper';

export default function(bundle) {
  return new Promise((resolve, reject) => {
    const contents = bundle.toString();

    //run in a sub-directory of `tradie` so that the `mocha` package is found
    //FIXME: should probably be run in the `.tradierc` directory
    const node = spawn('node', {cwd: __dirname});

    node
      .on('error', reject)
      .on('exit', resolve)
    ;

    //TODO: handle stream errors
    let stdout = node.stdout;
    let stderr = node.stderr;

    //extract the source map, replace URLs in stack traces from generated bundle with the URLs
    // from the original source files, and pipe the output to the console
    const result = mapper.extract(contents);
    const stream1 = mapper.stream(result.map);
    const stream2 = mapper.stream(result.map);
    stdout = stdout.pipe(stream1);
    stderr = stderr.pipe(stream2);

    //pipe test results to the console
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr); //TODO: colour it red

    //write the test bundle to node to start executing tests
    node.stdin.write(contents);
    node.stdin.end();

  });
}