const rc = require('rc');
const scriptDefaults = require('./scripts/defaults');
const styleDefaults = require('./styles/defaults');

module.exports = rc('buildtool', {});
module.exports.scripts = scriptDefaults(module.exports.scripts);
module.exports.styles = styleDefaults(module.exports.styles);