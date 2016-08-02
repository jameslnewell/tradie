# tradie

A semi-opinionated build tool for frontend projects. Use it to lint, bundle and test your script, style and asset files.

> Warning: This project is still experimental! Contributions welcome. Please [report any issues](https://github.com/jameslnewell/tradie/issues).

##### Goals

- abstract the tooling so that:
  - we setup new projects more quickly (e.g. no need for everyone to spend time researching specific tools and best practice for setting them up, just use `tradie` - we've done all the research and testing for you!)
  - we spend less time maintaining tooling (e.g. no need to keep all the tools up to date - just use `tradie`, a single dependency)
  - we are less impacted when we change tooling (e.g. no need to re-write all the tooling in your project - `tradie` will abstract (most of) the differences between the old and new tooling)
  - the project can still configure the tools

## Installation

    npm install --save-dev tradie

## Usage

1. Setup your project:

    ```
    src/
        index.js
        index.test.js

    tradie.config.js
    ```

    Try a generator
    e.g. [generator-tradie-react](https://www.npmjs.com/package/generator-tradie-react-app).

2. Build your project with:

    `npm run build`

3. Test your project with:

    `npm run test`

## Commands

### Clean

Clean bundled script, style and asset files.

    tradie clean

Removes all files from the `dest` directory.

### Linting

Lint script files.

    tradie lint

Uses `eslint` to lint script files in the `src` directory.

### Building

Bundle script, style and asset files.

    tradie build --watch

Uses `webpack` to bundle script, style and asset files.

Use the `--watch` flag to re-bundle script and style files whenever they change.

Set `NODE_ENV=production` to optimize script, style and asset files e.g. `cross-env NODE_ENV=production tradie build`

### Testing

Test script files.

    tradie test --watch

Uses `webpack` to bundle test files and runs the generated bundle with `mocha`.

Use the `--watch` flag to re-test script files whenever they change.

## Configuration

```js
module.exports = {

  src: './src/',
  dest: './dist/',
  tmp: './tmp',

  script: {
    bundles: ['./index.js'],
    vendors: [],
    extensions: ['.js']
  },

  style: {
    extensions: ['.css', '.scss']
  },

  asset: {
    extensions: [
      '.jpeg', '.jpg', '.gif', '.png', '.svg',
      '.woff', '.ttf', '.eot'
    ]
  },

  webpack: {},

  plugins: []

};
```

## Related packages

### Templates

- [generator-tradie-react](https://www.npmjs.com/package/generator-tradie-react)

### Plugins

- [tradie-plugin-livereload](https://www.npmjs.com/package/tradie-plugin-livereload)
- [tradie-plugin-serve](https://www.npmjs.com/package/tradie-plugin-serve)
- [tradie-plugin-copy](https://www.npmjs.com/package/tradie-plugin-copy)
