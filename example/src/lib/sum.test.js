import sum from './sum';

describe('sum()', () => {

  it('should pass', () => {
    expect(sum(1, 2)).to.be.equal(3);
  });

  it('should fail', () => {
    expect(sum(1, 2)).to.be.equal(4);
  });

});
