import createFile from './createFile';

export default function createJsonFile(file, json = {}) {
  return createFile(file, JSON.stringify(json, null, 2));
}