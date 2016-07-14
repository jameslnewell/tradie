import fs from 'fs';
import path from 'path';
import resolve from 'resolve';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import mapExtensionsToRegExp from './mapExtensionsToRegExp';
import CheckVersionConflictPlugin from './CheckVersionConflictPlugin';

export default function configureStyleLoader(options, config) {
  const {optimize, src, extensions} = options;

  config.sassLoader = {
    importer: (url, prev, done) => {

      //FIXME: pending https://github.com/jtangelder/sass-loader/issues/234
      const basedir = prev === 'stdin' ? src : path.dirname(prev);

      resolve(url, {

        basedir,

        //look for SASS and CSS files
        extensions,

        //allow packages to define a SASS entry file using the "main.scss", "main.sass" or "main.css" keys
        packageFilter(pkg) {
          pkg.main = pkg['main.scss'] || pkg['main.sass'] || pkg['main.css'] || pkg['style'];
          return pkg;
        }

      }, (resolveError, file) => {
        if (resolveError) {
          return done(resolveError);
        } else {

          if (path.extname(file) === '.css') {
            fs.readFile(file, (readError, data) => {
              if (readError) {
                return done(readError);
              } else {
                return done({file, contents: data.toString()});
              }
            });
          } else {
            return done({file});
          }

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
    loader: ExtractTextPlugin.extract('style', [
      'css-loader?sourceMap',
      'postcss-loader?sourceMap',
      'resolve-url-loader?sourceMap',
      'sass-loader?sourceMap'
    ])
  });

  config.plugins = config.plugins.concat([
    new ExtractTextPlugin(optimize ? '[name].[contenthash].css' : '[name].css', {allChunks: true}),
    new CheckVersionConflictPlugin({
      include: mapExtensionsToRegExp(extensions)
    })
  ]);

}
