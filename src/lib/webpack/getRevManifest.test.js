import getRevManifest from './getRevManifest.js';

describe('getRevManifest()', () => {

  it('should return asset revisions', () => {

    const stats = {};

    expect(getRevManifest(stats)).to.be.deep.equal({

    });

  });

});
