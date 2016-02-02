'use strict';
const assert = require('assert');
const sum = require('./_sum.js');

describe('sum', function() {
  it('should fail', function() {
    assert.equal(sum(1, 2), 3);
    assert.equal(sum(1, 3), 3);
  });
});