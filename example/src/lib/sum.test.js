import assert from 'assert';
import sum from './sum';

describe('sum()', function() {

  it('should pass', function() {
    assert.equal(sum(1, 2), 3);
  });

  it('should fail', function() {
    assert.equal(sum(1, 2), 4);
  });

});
