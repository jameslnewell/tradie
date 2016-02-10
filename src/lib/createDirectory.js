import mkdirp from 'mkdirp';

export default function createDirectory(path) {
  return new Promise((resolve, reject) => {
    mkdirp(path, error => {
      if (error) return reject(error);
      resolve();
    });
  });
}