const deepMerge = require('../lib/deepMerge');

describe('deepMerge()', () => {

  it('should contain the original values WHEN no properties are specified', () => {

    const merged = deepMerge(
      {
        level: 1,
        children: {
          level: 2,
          children: {
            level: 3,
            children: {
              level: 4
            }
          }
        },
      },
      {}
    );

    expect(merged).has.property('level').equal(1)
    expect(merged).has.property('children').has.property('level').equal(2);
    expect(merged).has.property('children').has.property('children').has.property('level').equal(3);
    expect(merged).has.property('children').has.property('children').has.property('children').has.property('level').equal(4);

  });

});
