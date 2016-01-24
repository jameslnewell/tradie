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