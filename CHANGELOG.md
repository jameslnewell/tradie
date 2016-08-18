
# Change log

## 1.1.0

- add: resolve bundle names to the `src` directory - this means the `./` prefix is not required and enforces the bundle 
cannot be a dependency name

## 1.0.3

- fix: remove unintended `console.log`

## 1.0.2

- fix: fix event functions to proxy to the emitter so they don't fail referring to `this`

## 1.0.1

- fix: webpack errors not displayed while watching
- fix: plugins not called on exit

## 1.0.0

Overall, the breaking changes are small and easily fixed. Continue reading about the minor breaking changes:

**user:**

- break: remove concept of context based configuration (e.g. `$.optimize`, `$.test`) and added the ability to export a factory function for returning configuration
- add: tradie will look for a `.eslintrc` or `.babelrc` file if no configuration is provided for `eslint` or `babel` keys
- add: added `script.outputFilename`, `style.outputFilename` and `asset.outputFilename` for overriding the output 
filenames created by webpack
- break: plugins are no longer specified by name and loaded by tradie, they're passed to tradie as a function
- break: use `--optimize` instead of `NODE_ENV="production"` to trigger a production build
- break: moved eslint and babel config from `.eslintrc` and `.babelrc` into `tradie.config.js` 
- break: errors are no longer hidden behind `--verbose` and are always displayed
- break: renamed `scripts` to `script` and `styles` to `style`
- break: migrated to `eslint` v2
- break: switch `.tradierc` from JSON to JS and renamed it to `tradie.config.js`
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
- break: removed `scripts.externals` due to specific browserify/webpack specific nature - you can specifiy extra webpack config at `webpack`
- add: a `common.js` generated with modules common to multiple bundles
- add: fingerprinting of clientside JS assets when `NODE_ENV=production`
- add: a version command
- add: ability to provide additional webpack configuration
- add: display an error and exit with an error status code when conflicting versions of a package is used in a stylesheet

**plugin:**

- break: the `scripts.bundle.finished` event returns the time elapsed for all assets generated in the webpack compilation (have to run webpack with profiling enabled to get that information)
- break: the `scripts.bundle.finished` event no longer returns the error encountered whilst creating an individual bundle (webpack lumps them all in one error object)
- break: the `scripts.bundling.finished` event no longer returns whether an error occurred but an array of all the error strings - overly verbose

### 0.8.2-3

- fix: report UglifyJS errors with more detail, and still output the scripts

## 0.8.0

- add: made browserify `externals` configurable via `scripts.externals`
- add: specify additional test config when running tests

## 0.7.10

- fix: dist-tags went wrong and npm is showing the wrong readme

## 0.7.8-9

- fix: CSS minification

## 0.7.5-7

- fix: use the full relative bundle path when creating the bundle output

## 0.7.4

- fix: case-sensitive issues on linux

## 0.7.0

- fix: bug with bundling for node - `incremental-browserify` seems to force it to be bundled for the browser
- fix: bug with linting attempting to lint the `package.json` file after `watchify` reports it as changed
- fix: bug with bundles targeting for nodejs shouldn't exclude vendor libs because there's no way to include them like on the client'
- fix: bug with script/style build times - was reporting sum of times instead of reporting the largest time
- fix: bug with tests - the test bundler was not using extensions configured by the user
- fix: bug with tests - the test bundler was bundling for the browser, not node where they're being run
- add: if a script entry point is named `server.js` then it is bundled to run on nodejs

## 0.6.3

- fix: added missing deps to `package.json`

## 0.6.1

- fix: don't use `String.startsWith()` cause node v4

## 0.6.0

- break: template/plugin names starting with `@` will no longer be prefxed with `tradie-template`/`tradie-plugin` in order
to allow privately scoped templates/plugins

## 0.5.3

- fix: incorrect plugin doco

## 0.5.2

- fix: emitting the wrong event when a style bundle errored which meant the error wasn't displaying

## 0.5.1

- fix: linter wasn't using script extensions
- fix: init command would fail if there was an existing `.tradierc` file that had an error in it

## 0.5.0

- add: ability to pass in `mocha` options via `.mocharc` file
- fix: made bundling of tests more reliable, but slower by not using `browserify-incremental`
- fix: while watching with the build command, linting failures were preventing the bundle from being built (and watching starting) and linting was not re-run on change

## 0.4.0

- add: ability to write templates for initialising tradie
- add: started writing unit-tests for tradie

## 0.3.0

- add: ability to write plugins for extending tradie
- break: large refactoring of the "API"

## 0.2.0

- add: make script extensions configurable
- add: allow environment specific configuration (like in `.babelrc` files)
- add: allow `browserify` plugins
