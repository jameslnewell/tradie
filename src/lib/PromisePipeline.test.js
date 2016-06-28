import {pipe, mixin} from './PromisePipeline';

describe('pipe', () => {

  it('should pass the result of each stage as the input to the next stage', () =>
    pipe([
      input => {
        expect(input).to.be.equal(1);
        return 2;
      },
      input => {
        expect(input).to.be.equal(2);
        return 3;
      },
      input => {
        expect(input).to.be.equal(3);
        return 4;
      }
    ], 1)
      .then(output => expect(output).to.be.equal(4))
  );

  it('should wait for the previous stage to resolve before starting the next stage', () => {

    let stage1Finished = false;
    let stage2Finished = false;

    return pipe([
      () => new Promise(resolve => setTimeout(() => {
        stage1Finished = true;
        resolve();
      }, 10)),
      () => {
        expect(stage1Finished).to.be.true;
        return new Promise(resolve => setTimeout(() => {
          stage2Finished = true;
          resolve();
        }, 10));
      }
    ])
      .then(() => expect(stage2Finished).to.be.true)
    ;

  });

});

describe.only('mixin', () => {

  it('should initialise the handlers as an empty object', () => {
    const pipeline = mixin();
    expect(pipeline.__handlers).to.be.an('object');
    expect(Object.keys(pipeline.__handlers)).to.be.length(0);
  });

  describe('on', () => {

  });

  describe('off', () => {

  });

  describe('emit', () => {

    it('should resolve the handlers', () =>
      mixin()
        .on('alphabet', () => 'abc')
        .emit('alphabet')
        .then(output => expect(output).to.be.equal('abc'))
    );

  });

});
