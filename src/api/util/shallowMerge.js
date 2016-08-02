
/**
 * Merge two objects, concatenating arrays and replacing primatives
 * @param   {object} objA
 * @param   {object} objB
 * @returns {object} Returns a new object
 */
module.exports = (objA, objB) => {

  //make a copy of objA
  const config = Object.assign({}, objA);

  Object.keys(objB).forEach(key => {
    if (Array.isArray(objB[key]) && Array.isArray(objA[key])) {
      config[key] = [].concat(objA[key], objB[key]);
    } else if (typeof objB[key] === 'object' && typeof objA[key] === 'object') {
      config[key] = Object.assign({}, objA[key], objB[key]);
    } else {
      config[key] = objB[key];
    }
  });

  return config;
};
