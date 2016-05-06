# tradie

A semi-opinionated build tool for frontend projects. Use it to lint, bundle and test your script and style files.

> Warning: This project is still experimental! Contributions welcome. Please [report any issues](https://github.com/jameslnewell/tradie/issues).

##### Goals

- abstract the tooling so that:
  - we setup new projects more quickly (e.g. no need for everyone to spend time researching specific tools and best practice for setting them up, just use `tradie` - we've done all the research and testing for you!)
  - we spend less time maintaining tooling (e.g. no need to keep all the tools up to date - just use `tradie`, a single dependency)
  - we are less impacted when we change tooling (e.g. no need to re-write all the tooling in your project - `tradie` will abstract (most of) the differences between the old and new tooling)
- the project can still configure the tools
-

## Installation

    npm install --save-dev tradie

## Usage

1. Setup your project:

    Try a tradie generator (coming soon).

2. Build your project with:

    `npm run build`

3. Test your project with:

    `npm run test`

## Tasks

### Clean

Delete bundled script and style files.

    tradie clean

Removes all files from the `dest` directory.

### Linting

Lint script files.

    tradie lint

Uses `eslint` to lint script files in the `src` directory. `eslint` may be configured using an `.eslintrc` file. Find out more about configuring `eslint` [here](http://eslint.org/docs/user-guide/configuring).

### Building

Lint and bundle script and style files

    tradie build --watch --verbose

Uses `webpack` and `sass-composer` to bundle script and style files. Browserify transforms and plugins may be specified in your `.tradierc` file. Styling rules are `autoprefix`ed.

Use the `--watch` flag to re-bundle script and style files whenever they change.

Set `NODE_ENV=production` to minify script and style files e.g. `cross-env NODE_ENV=production tradie build`


### Testing

Test script files.

    tradie test --watch

There's no need to setup extensions or compilers for `mocha`, this command bundles all your test files (`*.test{.js,.jsx,etc`) using your `webpack` loaders/plugins, then runs the generated test bundle with `mocha`.

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

```json
{
  "src": "./src/", //the directory where files are sourced relative to the .tradierc file
  "dest": "./dist/", //the directory where files are output relative to the .tradierc file
  "scripts": {
    "bundles": ["./index.js"], //the script entry files relative to the `src` dir
    "vendors": [], //the third-party packages placed into `vendor.js` for long term caching
    "loaders": [], //the webpack loaders
    "plugins": [], //the webpack plugins
    "externals": [], //the webpack externals
    "extensions": [".js"] //the script extensions
  },
  "tests": { //these settings are merged with the `scripts` for test specific overrides
    "externals": ["react", "react-dom"]
  },
  "styles": {
    "bundles": ["./index.scss"] //the style entry files relative to the `src` dir
  },
  "plugins": [] //the tradie plugins
}
```

## Related packages

### Templates

- [generator-tradie-react](https://www.npmjs.com/package/generator-tradie-react)

### Plugins

- [tradie-plugin-livereload](https://www.npmjs.com/package/tradie-plugin-livereload)
- [tradie-plugin-serve](https://www.npmjs.com/package/tradie-plugin-serve)
- [tradie-plugin-copy](https://www.npmjs.com/package/tradie-plugin-copy)

## Change log

### webpack

Overall, the breaking changes are small and easily fixed. Continue reading about the minor breaking changes:

**user:**

- break: remove `tradie init` command and templating - its really a separate concern and there's better tools out there that do the scaffolding, and having tradie installed locally and globally often lead to user errors
- break: bundle paths must be prefixed with `./` otherwise webpack will look for them in `./node_modules`  e.g. `index.js` must be changed to `./index.js`
- break: vendor bundle configuration has changed from `scripts.libraries` to `scripts.vendors`
- break: browserify transform configuration has changed from `scripts.transforms` to `scripts.loaders` (a webpack loader name)
- break: browserify plugin configuration has changed from `scripts.plugins` to `scripts.plugins` (a webpack plugin instance)
- break: remove the `bundle`, `bundle-scripts` and `bundle-styles` commands
- break: script bundle information is reported slightly differently (due to changes below)
- break: script files are linted using webpack which means only files included in the bundle are linted - test files are now linted during testing
- break: `src` and `dist` are no longer configured individually for scripts and styles
- break: `require` in `.mocharc` has been renamed to `requires`
- add: a `common.js` generated with modules common to multiple bundles
- add: fingerprinting of clientside JS assets when `NODE_ENV=production`
- add: a version command

**plugin:**

- break: the `scripts.bundle.finished` event returns the time elapsed for all assets generated in the webpack compilation (have to run webpack with profiling enabled to get that information)
- break: the `scripts.bundle.finished` event no longer returns the error encountered whilst creating an individual bundle (webpack lumps them all in one error object)
- break: the `scripts.bundling.finished` event no longer returns whether an error occurred but an array of all the error strings - overly verbose

### 0.8.0

- add: made browserify `externals` configurable via `scripts.externals`
- add: specify additional test config when running tests

### 0.7.10

- fix: dist-tags went wrong and npm is showing the wrong readme

### 0.7.8-9

- fix: CSS minification

### 0.7.5-7

- fix: use the full relative bundle path when creating the bundle output

### 0.7.4

- fix: case-sensitive issues on linux

### 0.7.0

- fix: bug with bundling for node - `incremental-browserify` seems to force it to be bundled for the browser
- fix: bug with linting attempting to lint the `package.json` file after `watchify` reports it as changed
- fix: bug with bundles targeting for nodejs shouldn't exclude vendor libs because there's no way to include them like on the client'
- fix: bug with script/style build times - was reporting sum of times instead of reporting the largest time
- fix: bug with tests - the test bundler was not using extensions configured by the user
- fix: bug with tests - the test bundler was bundling for the browser, not node where they're being run
- add: if a script entry point is named `server.js` then it is bundled to run on nodejs

### 0.6.3

- fix: added missing deps to `package.json`

### 0.6.1

- fix: don't use `String.startsWith()` cause node v4

### 0.6.0

- break: template/plugin names starting with `@` will no longer be prefxed with `tradie-template`/`tradie-plugin` in order
to allow privately scoped templates/plugins

### 0.5.3

- fix: incorrect plugin doco

### 0.5.2

- fix: emitting the wrong event when a style bundle errored which meant the error wasn't displaying

### 0.5.1

- fix: linter wasn't using script extensions
- fix: init command would fail if there was an existing `.tradierc` file that had an error in it

### 0.5.0

- add: ability to pass in `mocha` options via `.mocharc` file
- fix: made bundling of tests more reliable, but slower by not using `browserify-incremental`
- fix: while watching with the build command, linting failures were preventing the bundle from being built (and watching starting) and linting was not re-run on change

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

- move `scripts.src|dest` and `styles.src|dest` to `src|dest`
- do we need to lint all files on re-bundle while watching? test files aren't watched so it makes it hard to check linting of test files. maybe we need to add a watch arg to the lint command that watches everything, not just what's being bundled
- resolve `eslint` configs relative to the current working dir
- handle errors on browserify object (not just the bundle)
- make/find cache-bust and image optimisation CLIs
- `npm install` after init
- finish writing unit and integration tests
- make a hmr plugin
- make `autoprefixer` configurable
- make `uglify` configurable
- make `sass-composer` configurable
- replace sass-composer with a postcss pipeline
- make a code-splitting example