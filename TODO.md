## To do

- do we need to lint all files on re-bundle while watching? test files aren't watched so it makes it hard to check linting of test files. maybe we need to add a watch arg to the lint command that watches everything, not just what's being bundled
- resolve `eslint` configs relative to the current working dir
- find image optimisation plugin
- finish writing unit and integration tests
- make a hmr plugin
- make `autoprefixer` configurable
- make `uglify` configurable
- make `sass-composer` configurable
- replace sass-composer with a postcss pipeline
- make a code-splitting example