# tradie

A semi-opinionated build tool for frontend projects. Use it to lint, bundle and test your script, style and asset files.

> Contributions welcome. Please [report any issues](https://github.com/jameslnewell/tradie/issues).

##### Goals

- abstract the tooling so that:
  - we setup new projects more quickly (e.g. no need for everyone to spend time researching specific tools and best practice for setting them up, just use `tradie` - we've done all the research and testing for you!)
  - we spend less time maintaining tooling (e.g. no need to keep all the tools up to date - just use `tradie`, a single dependency)
  - we are less impacted when we change tooling (e.g. no need to re-write all the tooling in your project - `tradie` will abstract (most of) the differences between the old and new tooling)
  - the project can still override some of the tools
  - cater to common application types

##### Why not `create-react-app`?

[Create React App](https://github.com/facebookincubator/create-react-app) is a great tool and we'd highly recommend 
giving it a go! 
However
`create-react-app` is tailored to a specific use-case and doesn't support `CSS` pre-processing (e.g. `SASS`), multiple 
bundles or UniversalJS applications. Tradie supports `SASS` and a number of common application types.

## Installation

    npm install --save-dev tradie

## Usage

1. Setup your project:

    ```
    src/
        index.js
        index.test.js
    ```

    Use a generator rather than doing it manually!
    e.g. [generator-tradie-react](https://www.npmjs.com/package/generator-tradie-react-app).

2. Build your project with:

    `npm run build`

3. Test your project with:

    `npm run test`

## Project Structure

```
    
src/
    index.js
    index.test.js
    
dest/
    rev-manifest.json
    index.abcdefg.js
    vendor.abcdefg.js
    
tmp/
    abcdefg.json.gzip
    vendor-manifest.json
    
```

### src/

The directory where your application source code lives. 

> Place all your script, style, asset and test files here.

### dest/

The directory where your application artifacts are generated.

> Don't change anything here! It'll be overwritten next time you build.

### tmp/

The directory where temporary files are generated.

> Don't change anything here! It'll be overwritten next time you build.

## Configuration

Tradie works out-of-the-box with no configuration. However, Tradie can be configured to support additional 
functionality by placing a `tradie.config.js` file in the project root. The file must export an `object`, 
or a `function` that returns an `object`. 

The default configuration for Tradie looks like this:

```js
module.exports = {

  script: {
    bundles: ['index.js'],
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

  eslint: {},
  babel: {},
  webpack: {},

  plugins: []
  
};
```

### script

#### .bundles

A list of module paths that will be bundled into script files.

Module paths are relative to your project's `src` directory.

> Optional. An `array` of `string`s. Defaults to `['index.js']`. 

> Example: Multiple bundles

You can create multiple bundles. Dependencies shared between all of the bundles will be bundled into a script file 
named 
`common.js`.

```js
module.exports = {
  script: {
    bundles: ['campaign/abc/index.js', 'campaign/xyz/index.js']
  }
};
```

> Example: UniversalJS bundles

You can create a bundle to run on NodeJS by naming your bundle `server`. Use this when you're sharing the bulk of 
your app code across both your server and client.

```js
module.exports = {
  script: {
    bundles: ['server.js', 'client.js']
  }
};
```

#### .vendors

A list of modules that will be bundled into a script file named `vendor.js`.

> Optional. An `array` of `string`s. Defaults to `[]`.

> Example: Long-term-caching

Bundle infrequently changing modules. These bundles usually make up a significant portion of your app and with 
long-term-caching they won't need to be (re)downloaded by the browser each time your app is deployed.

```js
module.exports = {
  script: {
    vendors: ['react', 'react-dom']
  }
};
```

#### .extensions

A list of extensions for script files.

> Optional. An `array` of `string`s. Defaults to `['.js]`.

> Example: Require script files ending in `.jsx` without specifying the extension

Additional file extensions can be supported for parsing and requiring script files.

```js
module.exports = {
  script: {
    extensions: ['.js', '.jsx']
  }
};
```

### style
#### .extensions

A list of extensions for style files.

> Optional. An `array` of `string`s. Defaults to `['.css', '.scss']`.

### asset
#### .extensions

A list of extensions for asset files.

> Optional. An `array` of `string`s. Defaults to `['.jpeg', '.jpg', '.gif', '.png', '.svg', '.woff', '.ttf', '.eot']`.

### eslint

Configuration used for linting. See [Configuring ESLint](http://eslint.org/docs/user-guide/configuring).

> Optional. An `object`. Defaults to the contents of your `.eslintrc` file.

### babel

Configuration used for transpiling. See [Options](https://babeljs.io/docs/usage/options/).

> Optional. An `object`. Defaults to the contents of your `.babelrc` file.

### webpack

Additional configuration passed to `webpack`. See [Configuration](https://webpack.github.io/docs/configuration.html).

> Optional. An `object`. Defaults to `{}`.

> Warning: Avoid using this escape hatch where possible, you'll be more susceptible to breaking changes when 
`webpack` is updated.

### plugins

A list of plugins that extend `tradie` to provide additional functionality.

> Optional. An `array` of `function`s. Defaults to `[]`.

> Example: Livereload

```js
var livereload = require('tradie-plugin-livereload');

module.exports = {
  plugins: [livereload()]
};
```

## Commands

### Clean

Remove bundled script, style and asset files.

    tradie clean

Removes all files from the `dest` directory.

### Linting

Lint script files.

    tradie lint

Uses `eslint` to lint script files in the `src` directory.

### Building

Bundle script, style and asset files.

    tradie build --watch --optimize

Uses `webpack` to bundle script, style and asset files.

Use the `--watch` flag to re-bundle script and style files whenever they change.

Use the `--optimize` flag to optimize script, style and asset files, including minification, dead-code removal, file 
hashing etc.

### Testing

Test script files.

    tradie test --watch

Uses `webpack` to bundle test files and runs the generated bundle with `mocha`.

Use the `--watch` flag to re-test script files whenever they change.

## Change log

[CHANGELOG.md](https://github.com/jameslnewell/tradie/blob/webpack/CHANGELOG.md)

## Roadmap

[Milestones](https://github.com/jameslnewell/tradie/milestones)

## Related packages

### Templates

- [generator-tradie-react](https://www.npmjs.com/package/generator-tradie-react)

### Plugins

- [tradie-plugin-livereload](https://www.npmjs.com/package/tradie-plugin-livereload)
- [tradie-plugin-serve](https://www.npmjs.com/package/tradie-plugin-serve)
- [tradie-plugin-copy](https://www.npmjs.com/package/tradie-plugin-copy)
