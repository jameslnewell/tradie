import minimatch from 'minimatch';

/**
 * Create a filter function from glob pattern
 * @param   {string|Array<string>|function}   filter  The glob pattern, an array of glob patterns or a filer function
 * @returns {function}
 */
export default filter => {

  if (typeof filter === 'string') {
    return file => minimatch(file, filter, {matchBase: true});
  }

  if (Array.isArray(filter)) {
    return file => filter.every(glob => minimatch(file, glob, {matchBase: true}));
  }

  if (typeof filter === 'function') {
    return filter;
  }

  throw new Error('Invalid file filter')
};
