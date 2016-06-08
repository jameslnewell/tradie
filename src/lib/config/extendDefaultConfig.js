import shallowMerge from './../util/shallowMerge';
import defaultConfig from './defaultConfig';

export default userConfig => shallowMerge(defaultConfig, userConfig);