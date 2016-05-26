
export default function mapExtensionsToRegExp(extensions) {
  return new RegExp(extensions.join('$|').replace('.', '\\.') + '$');
}