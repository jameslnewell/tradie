import path from 'path';
import createFile from '../createFile';
import createJsonFile from '../createJsonFile';
import createDirectory from '../createDirectory';

function createEslintConfig() {
  const json = {
    env: {
      browser: true,
      mocha: true
    },
    extends: 'eslint:recommended'
  };
  return createJsonFile('.eslintrc', json);
}

function createSourceDirectory(config) {
  return createDirectory(config.src);
}

function createScriptFile(config) {
  return createFile(path.join(config.src, 'index.js'));
}

function createTestFile(config) {
  return createFile(path.join(config.src, 'index.test.js'));
}

export default function(config, options, emitter) {
  return Promise.all([
    createEslintConfig(),
    createSourceDirectory(config)
      .then(() => Promise.all([
        createScriptFile(config),
        createTestFile(config)
      ]))
  ]);
};
