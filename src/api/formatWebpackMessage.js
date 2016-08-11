import chalk from 'chalk';

// const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stripStack
  = message => message.replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '')
;

export default function(config, message) {

  if (message.indexOf('Module build failed: SyntaxError:') !== -1) {
    // ./src/client.js
    //   Module build failed: SyntaxError: <path>/src/client.js: Unterminated regular expression (17:1)
    //   15 | );
    //   16 |
    //   > 17 | /\.
    // |  ^
    //   at Parser.pp.raise (<path>/node_modules/babylon/lib/parser/location.js:22:13)
    //...
    // @ ./src/client.js 13:11-31
    // @ ./src/client.js
    const matches = message.match(/^([^\s]*).*[^:]+: [^:]+: [^:]+: ([\S\s]*)/);
    const file = matches[1];
    const detail = stripStack(matches[2]);
    return `${chalk.red(`SYNTAX ERROR in ${file}`)}\n\n ${detail}`;
  }
  
  // if (message.indexOf('Module not found: Error:') !== -1) {
  //   // ./src/lib/sum.js
  //   //   Module not found: Error: Can't resolve './foobasdrt' in '<path>/src/lib'
  //   //   resolve './foobasdrt' in '<path>/src/lib'
  //   //   using description file: <path>/package.json (relative path: ./src/lib)
  //   //   Field 'browser' doesn't contain a valid alias configuration
  //   //   after using description file: <path>/package.json (relative path: ./src/lib)
  //   //   using description file: <path>/package.json (relative path: ./src/lib/foobasdrt)
  //   //   as directory
  //   //   <path>/src/lib/foobasdrt doesn't exist
  //   //   no extension
  //   //   Field 'browser' doesn't contain a valid alias configuration
  //   //   <path>/src/lib/foobasdrt doesn't exist
  //   //   Field 'browser' doesn't contain a valid alias configuration
  //   //   <path>/src/lib/foobasdrt doesn't exist
  //   //     .js
  //   //   Field 'browser' doesn't contain a valid alias configuration
  //   //   <path>/src/lib/foobasdrt.js doesn't exist
  //   //     .jsx
  //   //   Field 'browser' doesn't contain a valid alias configuration
  //   //   <path>/src/lib/foobasdrt.jsx doesn't exist
  //   //     .json
  //   //   Field 'browser' doesn't contain a valid alias configuration
  //   //   <path>/src/lib/foobasdrt.json doesn't exist
  //   //     [<path>/src/lib/foobasdrt]
  //   //   [<path>/src/lib/foobasdrt]
  //   //     [<path>/src/lib/foobasdrt]
  //   //   [<path>/src/lib/foobasdrt.js]
  //   //     [<path>/src/lib/foobasdrt.jsx]
  //   //   [<path>/src/lib/foobasdrt.json]
  //   // @ ./src/lib/sum.js 17:0-22
  //   // @ ./src/client.js
  //   const file = '';
  //   const detail = message.replace(new RegExp(escapeRegExp(config.root), 'g'), '.');
  //   return `${chalk.red(`MODULE NOT FOUND ERROR in ${file}`)}\n\n ${detail}`;
  // }

  return message;
}
