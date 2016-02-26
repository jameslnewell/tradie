import resolveModule from 'resolve';

export default function(plugins, tradie) {

  //load plugins
  return Promise.all(plugins.map(plugin => {

    let pluginName = null;
    let pluginOptions = {};

    //extract the plugin name and options
    if (Array.isArray(plugin)) {

      //no plugin name so ignore this "plugin"!
      if (plugin.length === 0) {
        return Promise.resolve();
      }

      pluginName = plugin[0];

      //get the plugin options
      if (plugin.length > 1) {
        pluginOptions = plugin[1];
      }

    } else {
      pluginName = plugin;
    }

    //ensure we have the full name of the plugin
    if (!pluginName.startsWith('tradie-plugin-')) {
      pluginName = `tradie-plugin-${pluginName}`;
    }

    //load the plugin
    return new Promise((resolve, reject) => {
      resolveModule(pluginName, {basedir: process.cwd()}, (err, file) => {
        if (err) return reject(new Error(`Cannot find plugin "${pluginName}".`));

        //require the plugin
        let fn = null;
        try {
          fn = require(file); //eslint-disable-line
          fn = fn.default || fn;
        } catch (error) {
          throw new Error(`Cannot load plugin "${pluginName}".`);
        }

        //run the plugin
        try {
          fn(tradie, pluginOptions);
        } catch (error) {
          console.log(error.stack);
          throw new Error(`Cannot run plugin "${pluginName}".`);
        }

        resolve();

      });
    });

  }));

}
