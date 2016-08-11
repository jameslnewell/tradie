
export default function(extensions) {
  let globExtension = '';
  if (extensions.length > 1) {
    globExtension = `{${extensions.join(',')}}`;
  } else {
    globExtension = extensions.join('');
  }
  return globExtension;
}
