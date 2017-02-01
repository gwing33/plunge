import {TestScheduler} from 'rxjs';

describe('Global Stream Tests', () => {
  it('Should send a message without data', () => {
    const rxTestScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    const {globalStream} = require('../globalStream');

    const main     = '--a--b--c--|';
    const expected = '-----b-----|';

    const mainVals = {
      a: {foo: "bar"},
      b: {action: "world"},
      c: {bar: "foo"}
    };
    const expectedVals = {
      b: {action: "world", data: {}}
    };

    // Subscribe to the global stream to start listening for values.
    rxTestScheduler.expectObservable(globalStream).toBe(expected, expectedVals);

    // Redirect the values into the globalStream
    const result = rxTestScheduler.createHotObservable(main, mainVals).do(
      x => globalStream.next(x), e => globalStream.error(e), () => globalStream.complete()
    );

    // Add test data to be able to be flushed, which will flow the data to the globalStream.
    rxTestScheduler.expectObservable(result).toBe(main, mainVals);

    // Flush the tests which will run the deep compare
    rxTestScheduler.flush();
  });
});
