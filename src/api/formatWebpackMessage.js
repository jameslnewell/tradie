import chalk from 'chalk';

const stripStack =
  message => message.replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '')
;

export default function(message) {

  if (message.indexOf('SyntaxError:') !== -1) {
    // ./src/client.js
    //   Module build failed: SyntaxError: /Users/james/Work/Code/prj/deit/Github/jameslnewell/tradie/example/src/client.js: Unterminated regular expression (17:1)
    //   15 | );
    //   16 |
    //   > 17 | /\.
    // |  ^
    //   at Parser.pp.raise (/Users/james/Work/Code/prj/deit/Github/jameslnewell/tradie/example/node_modules/babylon/lib/parser/location.js:22:13)
    //...
    const matches = message.match(/^([^\s]*).*[^:]+: [^:]+: [^:]+: ([\S\s]*)/);
    const file = matches[1];
    const detail = stripStack(matches[2]);
    return `${chalk.bgRed(`SYNTAX ERROR in ${file}`)}\n\n ${detail}`;
  }

  return message;
}
