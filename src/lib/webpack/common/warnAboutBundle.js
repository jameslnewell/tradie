import fileName from 'file-name';

export default function warnAboutBundle(bundle) {
  const basename = fileName(bundle);

  //check for reserved bundle names
  if (basename === 'vendor' || basename === 'common') {
    throw new Error(`'${basename}' is a reserved bundle name. Please use a different name.`);
  }

  //TODO: check if the bundle starts with './' and warn if it doesn't

}
