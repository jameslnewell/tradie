import path from 'path';
import resolve from 'resolve';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import mapExtensionsToRegExp from './mapExtensionsToRegExp';

export default function configureStyleLoader(options, config) {
  const {minimize, root, src, extensions} = options;

  config.sassLoader = {
    importer: (url, prev, done) => {

      //FIXME: pending https://github.com/jtangelder/sass-loader/issues/234
      const basedir = prev === 'stdin' ? path.resolve(root, src) : path.dirname(prev);

      resolve(url, {

        basedir,

        //look for SASS and CSS files
        extensions: ['.scss', '.sass', '.css'],

        //allow packages to define a SASS entry file using the "main.scss", "main.sass" or "main.css" keys
        packageFilter(pkg) {
          pkg.main = pkg['main.scss'] || pkg['main.sass'] || pkg['main.css'] || pkg['style'];
          return pkg;
        }

      }, (err, file) => {
        if (err) {
          return done(err);
        } else {
          return done({file});
        }
      });
    }
  };

  config.postcss = [
    autoprefixer({browsers: ['last 2 versions']})
    //NOTE: css-loader looks for NODE_ENV=production and performs minification so we don't need cssnano
  ];

  //parse SCSS, @import, extract assets, autoprefix and extract to a separate *.css file
  config.module.loaders.push({
    test: mapExtensionsToRegExp(extensions),
    loader: ExtractTextPlugin.extract('style-loader', ['css?sourceMap', 'postcss?sourceMap', 'resolve-url?sourceMap', 'sass?sourceMap'])
  });

  config.plugins = config.plugins.concat([
    new ExtractTextPlugin(minimize ? '[name].[contenthash].css' : '[name].css', {allChunks: true})
  ]);

}
