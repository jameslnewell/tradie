import rc from 'rc';
import merge from 'lodash.mergewith';
import scriptDefaults from './scripts/defaults';
import styleDefaults from './styles/defaults';

export default function(args) {

  function customizer(objValue, srcValue) {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }

  //figure out which env we're in
  const environment = args.debug ? 'development' : 'production';

  //merge the default config
  let config = rc('tradie', {});
  config.scripts = scriptDefaults(config.scripts);
  config.styles = styleDefaults(config.styles);

  //merge the env specific config
  if (config.env && config.env[environment]) {
    config = merge({}, config, config.env[environment], customizer);
  }

  //delete `rc` crap
  delete config._;
  delete config.env;
  delete config.config;
  delete config.configs;

  return config;
}
