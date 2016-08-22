import path from 'path';
import del from 'promised-del';

export default name => {

  const root = (p = '') => path.resolve(__dirname, `../fixture/${name}`, p);
  const src = (p = '') => path.resolve(root('./src'), p);
  const tmp = (p = '') => path.resolve(root('./tmp'), p);
  const dest = (p = '') => path.resolve(root('./dist'), p);

  //remove the /tmp and /dist folders from the fixture
  const clean = () => del([tmp(), dest()]);

  return {
    root, src, tmp, dest,
    clean
  };
};
