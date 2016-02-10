# tradie

An opinionated CLI for building frontend projects.

## Installation

    npm install --save tradie

## Usage

1. Install `tradie` in your project

    `npm install --save tradie`

2. Configure `tradie` in your project

  - Create a `.tradierc` file:

  - Setup some `npm` scripts in your `package.json`:

    ```json
    {
      "scripts": {
        "build": "tradie build",
        "test": "tradie test"
      }
    }
    ```

3. Build your project with `tradie`

    ```
    npm run build
    npm run test
    ```

## Tasks

### Linting

Lint scripts.

    tradie lint

Uses settings from your `.eslintrc` file to lint script files in the `src` directory.

### Bundling

Bundle scripts and styles.

    tradie bundle --watch --verbose --watch --production
    # OR
    tradie bundle-scripts --verbose --watch --production
    tradie bundle-styles --verbose --watch --production

### Building

Lint and bundle scripts and styles with a single command.

    tradie build --verbose --watch --production

### Testing

Test scripts.

    tradie test --watch

Uses settings from your `mocha.opts` file to run test files (`*.test.js`) in the `src` directory.