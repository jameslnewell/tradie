import path from 'path';
import fileName from 'file-name';

export default function configureStyles(options, config) {
  const {bundles} = options;

  bundles.forEach(bundle => {
    const dirName = path.dirname(bundle);
    const baseName = fileName(bundle);
    const chunkName = path.join(dirName, baseName);

    if (config.entry[chunkName]) {
      throw new Error(`Cannont add a new chunk named "${chunkName}" for "${bundle}" because one already exists for "${config.entry[chunkName]}". Please rename "${bundle}" or import "${bundle}" from another file.`);
    }

    config.entry[chunkName] = bundle;

  });

  //Note: Webpack adds an almost empty file for the created CSS

}
