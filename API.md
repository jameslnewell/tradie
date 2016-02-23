# API

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

A `Promise` that `resolve()`s when the command is complete.

> Note: Commands that watch files should not `resolve()` until they finish watching files.