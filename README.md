# tradie

An opinionated build tool for frontend projects. Use it to lint, bundle and test your script and style files.

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

    tradie bundle --watch --production --verbose
    # OR
    tradie bundle-scripts --watch --production --verbose
    tradie bundle-styles --watch --production --verbose

Uses `browserify` and `sass-composer` to bundle script and style files. Browserify transforms and plugins may be specified in your `.tradierc` file. Styling rules are `autoprefix`ed.

Use the `--watch` flag to re-bundle script and style files whenever they change.

Use the `--production` flag to minify script and style files.

### Building

Lint and bundle script and style files with a single command.

    tradie build --watch --production --verbose

Performs the linting and bundling steps listed above.

### Testing

Test script files.

    tradie test --watch

Runs test files (`*.test.js`) with `mocha`.

Use the `--watch` flag to re-test script files whenever they change.

## Configuration

### Scripts

```json
{
  "scripts": {
    "src": "src/", //the directory where script files are sourced
    "dest": "dist/", //the directory where bundled scripts are output
    "bundles": ["index.js"], //the script entry files
    "libraries": [], //the third-party packages placed into `vendor.js` for long term caching
    "transforms": [] //the browserify transform
  }
}
```

### Styles

```json
{
  "styles": {
    "src": "src/", //the directory where style files are sourced
    "dest": "dist/", //the directory where bundled styles are output
    "bundles": ["index.scss"] //the style entry files
  }
}
```

## To do

- re-run linting on build while watching (errors shouldn't exit the process)
- `npm install` on init
- make `mocha` configurable
- make `autoprefixer` configurable
- make `uglify` configurable
- make `sass-composer` configurable
- make a cache-bust and image optimisation plugin
- make a live-reload/hmr server plugin
- make a code-splitting example
- make an universaljs example
- add tests