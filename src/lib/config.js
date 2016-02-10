import rc from 'rc';
import scriptDefaults from './scripts/defaults';
import styleDefaults from './styles/defaults';

const config = rc('tradie', {});
config.scripts = scriptDefaults(config.scripts);
config.styles = styleDefaults(config.styles);

export default config;
