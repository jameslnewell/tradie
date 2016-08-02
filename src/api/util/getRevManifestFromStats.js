
export default function(stats) {
  const manifest = {};

  stats.chunks.forEach(chunk => {
    chunk.names.forEach(chunkName => {
      chunk.files.forEach(chunkFile => {

        //FIXME: hack assuming the hash has been added to the file in the format `[name].[hash].[ext]`
        const extensions = chunkFile.replace(/\?.*/, '').split('.');
        extensions.shift();
        extensions.shift();

        manifest[`${chunkName}.${extensions.join('.')}`] = chunkFile;

      });
    });
  });

  return manifest;
}
