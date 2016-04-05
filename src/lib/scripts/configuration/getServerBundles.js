import fileName from 'file-name';
import warnAboutBundle from './warnAboutBundle';

export default function getServerBundles(bundles) {
  const filtered = bundles.filter(bundle => fileName(bundle) === 'server');
  filtered.forEach(warnAboutBundle);
  return filtered;
}