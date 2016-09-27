import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import createClientConfig from '../../webpack/createClientConfig';

export default options => new Promise((resolve, reject) => {

    const config = createClientConfig(options);

    config.output.publicPath = '/';

    config.entry.client = [].concat(
      'webpack/hot/dev-server',
      'webpack-dev-server/client?http://localhost:8080/',
      config.entry.client
    );

    config.plugins.push(new webpack.NamedModulesPlugin());
    config.plugins.push(new webpack.HotModuleReplacementPlugin());

    const compiler = webpack(config);

    compiler.plugin('invalid', () => {
      console.log('Compiling...');
    });

    compiler.plugin('done', stats => {
      console.log('Finished compiling...');
    });

  console.log(config)


    const server = new WebpackDevServer(compiler, {
      publicPath: config.output.publicPath,
      hot: true,
      // inline: true,
      contentBase: options.dest,
      clientLogLevel: 'info',
      filename: '[name].js',
      // historyApiFallback: false,
      watchOptions: {
        ignored: /node_modules/
      },
      stats: {
        colors: true
      }
    });

    server.listen(8080, err => {
      if (err) return reject(err);

      console.log('Server started');

    });

});
