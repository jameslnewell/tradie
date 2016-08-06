import fs from 'fs';
import path from 'path';
import resolve from 'resolve';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import extensionsToRegex from 'ext-to-regex';
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
    autoprefixer({browsers: ['> 4%', 'last 4 versions', 'Firefox ESR', 'not ie < 9']})
    //NOTE: css-loader looks for NODE_ENV=production and performs minification so we don't need cssnano
  ];

  //parse SCSS, @import, extract assets, autoprefix and extract to a separate *.css file
  config.module.loaders.push({
    test: extensionsToRegex(extensions),
    loader: ExtractTextPlugin.extract({
      fallbackLoader: 'style-loader',
      loader: [
        `css-loader?-autoprefixer${optimize ? '' : '&sourceMap'}`,
        `postcss-loader${optimize ? '' : '?sourceMap'}`,
        `resolve-url-loader${optimize ? '' : '?sourceMap'}`, //devtool: [inline-]source-map is required for CSS source maps to work
        'sass-loader?sourceMap' //sourceMap required by resolve-url-loader
      ]
    })
  });

  config.plugins = config.plugins.concat([
    new ExtractTextPlugin({
      allChunks: true,
      filename: optimize ? '[name].[contenthash].css' : '[name].css'
    }),
    new CheckVersionConflictPlugin({
      include: extensionsToRegex(extensions)
    })
  ]);

}
