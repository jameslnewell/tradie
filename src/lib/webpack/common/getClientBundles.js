import fileName from 'file-name';
import warnAboutBundle from './warnAboutBundle';

export default function getClientBundles(bundles) {
  const filtered = bundles.filter(bundle => fileName(bundle) !== 'server');
  filtered.forEach(warnAboutBundle);
  return filtered;
}
