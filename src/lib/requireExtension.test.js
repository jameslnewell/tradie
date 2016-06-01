import assert from 'assert';
import sinon from 'sinon';
import requireExtension from '../lib/requireExtension';

describe('requireExtension()', () => {

  it('should throw an error when an extension cannot be resolved', () => {

    const resolve = sinon.stub().callsArgWith(2, new Error());

    return requireExtension('react', 'template', {resolve})
      .then(
        () => assert(false),
        err => assert.equal(err.message, 'Cannot resolve template "tradie-template-react".')
      )
    ;

  });

  it('should throw an when an extension cannot be required', () => {

    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().throws(new Error());

    return requireExtension('livereload', 'plugin', {resolve, require})
      .then(
        () => assert(false),
        err => assert.equal(err.message, 'Cannot require plugin "tradie-plugin-livereload".')
      )
    ;

  });

  it('should throw an when an extension is not a function', () => {

    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().returns({});

    return requireExtension('livereload', 'plugin', {resolve, require})
      .then(
        () => assert(false),
        err => assert.equal(err.message, 'Invalid plugin "tradie-plugin-livereload".')
      )
      ;

  });

  it('should call resolve() with the full template name when I use the prefix', () => {

    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().returns(() => {/*do nothing*/});

    return requireExtension('tradie-template-react', 'template', {resolve, require})
      .then(() => assert(resolve.calledWith('tradie-template-react')))
    ;

  });

  it('should call resolve() with the full template name when I do not use the prefix', () => {

    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().returns(() => {/*do nothing*/});

    return requireExtension('react', 'template', {resolve, require})
      .then(() => assert(resolve.calledWith('tradie-template-react')))
    ;

  });

  it('should call resolve() with the full template name when I use a scoped package', () => {

    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().returns(() => {/*do nothing*/});

    return requireExtension('@nib/tradie-template-react', 'template', {resolve, require})
      .then(() => assert(resolve.calledWith('@nib/tradie-template-react')))
    ;

  });

  it('should call resolve() with the full plugin name when I use the prefix', () => {

    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().returns(() => {/*do nothing*/});

    return requireExtension('tradie-plugin-livereload', 'plugin', {resolve, require})
      .then(() => assert(resolve.calledWith('tradie-plugin-livereload')))
    ;

  });

  it('should call resolve() with the full plugin name when I do not use the prefix', () => {

    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().returns(() => {/*do nothing*/});

    return requireExtension('livereload', 'plugin', {resolve, require})
      .then(() => assert(resolve.calledWith('tradie-plugin-livereload')))
    ;

  });

  it('should call resolve() with the full plugin name when I use a scoped package', () => {

    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().returns(() => {/*do nothing*/});

    return requireExtension('@nib/tradie-template-react', 'plugin', {resolve, require})
      .then(() => assert(resolve.calledWith('@nib/tradie-template-react')))
    ;

  });

  it('should return a function when the extension can be resolved and required', () => {

    const mockFn = () => {/*do nothing*/};
    const resolve = sinon.stub().callsArgWith(2, null, '');
    const require = sinon.stub().returns(mockFn);

    return requireExtension('tradie-plugin-livereload', 'plugin', {resolve, require})
      .then(fn => assert.equal(fn, mockFn))
    ;
  });

});
