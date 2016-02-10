import fs from 'fs';

export default function createFile(file, text = '') {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, text, error => {
      if (error) return reject(error);
      resolve();
    });
  });
}