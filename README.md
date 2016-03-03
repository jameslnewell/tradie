# tradie

An opinionated build tool for frontend projects. Use it to lint, bundle and test your script and style files.

> Warning: This project is still experimental! Please [report any issues](https://github.com/jameslnewell/tradie/issues).

## Installation

    npm install -g tradie

## Usage

1. Create your project with:

    `tradie init`

2. Build your project with:

    `npm run build`

3. Test your project with:

    `npm run test`

## Tasks

### Initialise

Create a new project.

    tradie init --force --template=tradie-template-react

Uses conventions to create a new project.

Use the `--force` flag to write to disk.

### Clean

Delete bundled script and style files.

    tradie clean

### Linting

Lint script files.

    tradie lint

Uses `eslint` to lint script files.

### Bundling

Bundle script and style files.

    tradie bundle --watch --verbose
    # OR
    tradie bundle-scripts --watch --verbose
    tradie bundle-styles --watch --verbose

Uses `browserify` and `sass-composer` to bundle script and style files. Browserify transforms and plugins may be specified in your `.tradierc` file. Styling rules are `autoprefix`ed.

Use the `--watch` flag to re-bundle script and style files whenever they change.

Set `NODE_ENV=production` to minify script and style files e.g. `cross-env NODE_ENV=production tradie build`

### Building

Lint and bundle script and style files with a single command.

    tradie build --watch --verbose

Performs the linting and bundling steps listed above.

### Testing

Test script files.

    tradie test --watch

There's no need to setup any compilers for `mocha`, this command bundles all your test files (`*.test.js`) using your `browserify` transforms/plugins, then runs the generated test bundle with `mocha`.

Mocha options may be configured in a `.mocharc` file:

```json
{
  "reporter": "spec",
  "timeout": 2000,
  "ui": "bdd",
  "colors": true,
  "require": []
}
```

Use the `--watch` flag to re-test script files whenever they change.

## Configuration

### Scripts

Configure script bundling.

```json
{
  "scripts": {
    "src": "src/", //the directory where script files are sourced
    "dest": "dist/", //the directory where bundled scripts are output
    "bundles": ["index.js"], //the script entry files
    "libraries": [], //the third-party packages placed into `vendor.js` for long term caching
    "transforms": [], //the browserify transform
    "plugins": [], //the browserify plugins
    "extensions": [".js"] //the script extensions
  }
}
```

### Styles

Configure style bundling.

```json
{
  "styles": {
    "src": "src/", //the directory where style files are sourced
    "dest": "dist/", //the directory where bundled styles are output
    "bundles": ["index.scss"] //the style entry files
  }
}
```

### Plugins

Configure tradie plugins.

```json
{
  "plugins": []
}
```

For example:

```json
{
  "plugins": [
    "tradie-plugin-livereload", // OR
    "livereload", // OR
    ["tradie-plugin-livereload", {"scripts": false}]
  ]
}
```

## Related packages

### Templates

- [tradie-template-react](https://www.npmjs.com/package/tradie-template-react)

### Plugins

- [tradie-template-livereload](https://www.npmjs.com/package/tradie-plugin-livereload)

## Change log


### 0.5.0

- add: ability to pass in `mocha` options via `.mocharc` file
- fix: made bundling of tests more reliable, but slower by not using `browserify-incremental`

### 0.4.0

- add: ability to write templates for initialising tradie
- add: started writing unit-tests for tradie

### 0.3.0

- add: ability to write plugins for extending tradie
- break: large refactoring of the "API"

### 0.2.0

- add: make script extensions configurable
- add: allow environment specific configuration (like in `.babelrc` files)
- add: allow `browserify` plugins

## To do

- re-run linting on build while watching (errors shouldn't exit the process)
- resolve `eslint` configs relative to the current working npm dir
- handle errors on browserify object (not just the bundle)
- `npm install` after init
- make a cache-bust and image optimisation plugin
- finish writing unit and integration tests
- make a hmr plugin
- make `autoprefixer` configurable
- make `uglify` configurable
- make `sass-composer` configurable
- make a code-splitting example
- make a universaljs example