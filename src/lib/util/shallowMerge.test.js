const mergeConfig = require('../lib/shallowMerge');

describe('shallowMerge()', () => {

  it('should merge the default values when there are no user values', () => {

    const mergedConfig = mergeConfig(
      {
        defaultValue: 'abc',
        defaultArray: ['a', 'b', 'c'],
        defaultObject: {a: 'a', b: 'b', c: 'c'}
      },
      {}
    );

    expect(mergedConfig).to.have.property('defaultValue', 'abc');
    expect(mergedConfig).to.have.property('defaultArray').deep.equal(['a', 'b', 'c']);
    expect(mergedConfig).to.have.property('defaultObject').deep.equal({a: 'a', b: 'b', c: 'c'});

  });

  it('should merge the user values when there are no default values', () => {

    const mergedConfig = mergeConfig(
      {},
      {
        userValue: 'abc',
        userArray: ['a', 'b', 'c'],
        userObject: {a: 'a', b: 'b', c: 'c'}
      }
    );

    expect(mergedConfig).to.have.property('userValue', 'abc');
    expect(mergedConfig).to.have.property('userArray').deep.equal(['a', 'b', 'c']);
    expect(mergedConfig).to.have.property('userObject').deep.equal({a: 'a', b: 'b', c: 'c'});

  });

  it('should merge top level object values', () => {

    const mergedConfig = mergeConfig(
      {
        obj: {a: 'a', b: 'b'}
      },
      {
        obj: {b: 'B', c: 'C'}
      }
    );

    expect(mergedConfig).to.have.property('obj').to.be.an('object');
    expect(mergedConfig.obj).to.have.property('a', 'a');
    expect(mergedConfig.obj).to.have.property('b', 'B');
    expect(mergedConfig.obj).to.have.property('c', 'C');

  });

  it('should merge top level array values', () => {

    const mergedConfig = mergeConfig(
      {
        arr: ['a', 'b']
      },
      {
        arr: ['B', 'C']
      }
    );

    expect(mergedConfig).to.have.property('arr').to.be.an('array');
    expect(mergedConfig.arr).to.have.property(0, 'a');
    expect(mergedConfig.arr).to.have.property(1, 'b');
    expect(mergedConfig.arr).to.have.property(2, 'B');
    expect(mergedConfig.arr).to.have.property(3, 'C');

  });

  it('should replace top level string values', () => {

    const mergedConfig = mergeConfig(
      {
        str: 'ab'
      },
      {
        str: 'bc'
      }
    );

    expect(mergedConfig).to.have.property('str', 'bc');

  });
});
