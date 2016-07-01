import extRegex from 'ext-to-regex';

export default function mapExtensionsToRegExp(extensions) {
  return extRegex(extensions);
}
