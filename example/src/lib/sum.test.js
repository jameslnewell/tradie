import assert from 'assert';
import sum from './sum';

describe('sum()', () => {

  it('should pass', () => {
    assert.equal(sum(1, 2), 3);
  });

  it('should fail', () => {
    assert.equal(sum(1, 2), 4);
  });

});
