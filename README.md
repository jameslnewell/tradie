# build-my-app

clean
build --watch
- lint --watch
- bundle --watch
  - bundle-scripts --watch
  - bundle-styles --watch
test --watch

plugins:
- serve - separate task
- optimise - hook into build

posisble names
brick/motar/glue
bake app-bake
workflow
bolier room

events:

- scripts:clean:start|finish
  - src
  - dest
  - error

- scripts:lint
  - src
  - dest
  - error

- scripts:bundle:start

- script:bundle:start
  - src
  - dest

- script:bundle:finish
  - src
  - dest
  - time
  - size
  - error

- scripts:bundle:finish

- style:bundle:start
  - src
  - dest

- style:bundle:finish
  - src
  - dest
  - time
  - size
  - error


## Tasks

### Linting

TODO:
- watching
- individual files

### Bundling

### Building

Perform linting and bundling of scripts and styles. Will exit with a failure if linting finds an error or if the bundles cannot be created.

### Testing

TODO:
- watching
- individual files