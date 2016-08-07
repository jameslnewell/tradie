import TradieError from './TradieError';
import requireExtension from './requireExtension';

/**
 * Execute a plugin by name
 * @param   {string} plugin
 * @param   {tradie} tradie
 * @returns {Promise.<Function>}
 */
function executePlugin(plugin, tradie) {
  try {
    plugin(tradie);
  } catch (error) {
    console.log(error);
    throw new TradieError(`Cannot execute plugin "${name}". \n\n\t ${error}`);
  }
}

/**
 * Execute plugins
 * @param   {tradie} tradie
 * @returns {Promise}
 */
export default function(tradie) {
  return Promise.all(
    tradie.config.plugins.map(plugin => executePlugin(plugin, tradie))
  );
}
