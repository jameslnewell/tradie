# API

## Tradie

### `.on(event, handler)`
### `.once(event, handler)`
### `.off(event, handler)`
### `.cmd(command)`
### `.run()`

### Events

#### Command

- `command.started`
- `command.finished`

#### Scripts

- `scripts.cleaning.started`
- `scripts.cleaning.finished`
- `scripts.linting.started`
- `scripts.linting.finished`
- `scripts.bundle.started`
- `scripts.bundle.finished`
- `scripts.bundling.started`
- `scripts.bundling.finished`
- `scripts.testing.started`
- `scripts.testing.finished`

#### Styles

- `styles.cleaning.started`
- `styles.cleaning.finished`
- `styles.bundle.started`
- `styles.bundle.finished`
- `styles.bundling.started`
- `styles.bundling.finished`

## Command

### `.name : string`

The name of the command.

### `.desc : string`

A description of what the command does.

### `.hint(yargs)`

A `function` that configures the argument parser.

**Parameters:**

 - `yargs` - An instance of `yargs`

**Returns:**

An instance of `yargs`

### `.exec({args, config, emitter})`

A `function` that executes the command action.

**Parameters:**

 - `args` - A dictionary object containing the arguments
 - `config` - A dictionary object containing the settings configured by the user in their `.tradierc` file
 - `emitter` - An event emitter

**Returns:**

A `Promise`:
 - `resolve(code)`s with an exit code when the command is complete
    - `0` on success e.g. linting/testing passed
    - non-`0` on failure e.g. linting/testing failed
 - `reject(error)`s with an error when the command e.g. failed to spawn the `mocha` cli

> Note: Commands that watch files should not `resolve()` until they finish watching files.