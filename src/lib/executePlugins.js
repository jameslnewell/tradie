import TradieError from './TradieError';
import requireExtension from './requireExtension';

/**
 * Execute a plugin by name
 * @param   {string} name         The plugin name
 * @param   {object} options      The plugin options
 * @param   {tradie} tradie
 * @returns {Promise.<Function>}
 */
function executePlugin(name, options, tradie) {
  return requireExtension(name, 'plugin')
    .then((fn) => {
      //execute the plugin
      try {
        fn(tradie, options);
      } catch (error) {
        console.log(error);
        throw new TradieError(`Cannot execute plugin "${name}". \n\n\t ${error}`);
      }
    })
  ;
}

/**
 * Execute plugins
 * @param   {tradie} tradie
 * @returns {Promise}
 */
export default function(tradie) {
  return Promise.all(tradie.config.plugins.map(plugin => {

    let name = null;
    let options = {};

    //extract the plugin name and options
    if (Array.isArray(plugin)) {

      //no plugin name so ignore this "plugin"!
      if (plugin.length === 0) {
        return null;
      }

      name = plugin[0];

      //get the plugin options
      if (plugin.length > 1) {
        options = plugin[1];
      }

    } else {
      name = plugin;
    }

    return executePlugin(name, options, tradie);
  }));
}
