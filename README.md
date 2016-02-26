# tradie

An opinionated build tool for frontend projects. Use it to lint, bundle and test your script and style files.

> Warning: This project is still experimental!

## Installation

    npm install -g tradie

## Usage

1. Create your project

    `tradie init`

2. Build your project

    `npm run build`

## Tasks

### Initialise

Create a new project.

    tradie init --force

Uses conventions to create a new project.

Use the `--force` flag to write to disk.

### Clean

Delete build files.

    tradie clean



### Linting

Lint scripts files.

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

Runs test files (`*.test.js`) with `mocha`.

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

Configure plugins.

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

## Change log

### 0.3.0

- add: ability to write plugins for tradie
- break: large refactoring of the "API"

### 0.2.0

- add: make script extensions configurable
- add: allow environment specific configuration (like in `.babelrc` files)
- add: allow `browserify` plugins

## To do

- `tradie init` templates e.g. `tradie-template-react` and `tradie-template-react-universal`
- re-run linting on build while watching (errors shouldn't exit the process)
- make `mocha` configurable e.g. require bootstrap file
- resolve `eslint` configs relative to the current working npm dir
- handle errors on browserify object (not just the bundle)
- `npm install` on init
- make `autoprefixer` configurable
- make `uglify` configurable
- make `sass-composer` configurable
- make a cache-bust and image optimisation plugin
- make a live-reload/hmr server plugin
- make a code-splitting example
- make a universaljs example
- add tests