import {TestScheduler} from 'rxjs';

describe('Global Stream Tests', () => {
  it('Should send a message without data', () => {
    const rxTestScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    const {globalStream} = require('../globalStream');

    const main        = '--a--b--c--|';
    const subscriber1 = '(a|)        ';
    const expected1   = '-----b-----|';
    const mainVals = {
      a: {foo: "bar"},
      b: {action: "world"},
      c: {bar: "foo"}
    };

    const sub1 = rxTestScheduler.createHotObservable(subscriber1).mergeMapTo(globalStream);
    const result = rxTestScheduler.createHotObservable(main, mainVals).do(
      x => globalStream.next(x), e => globalStream.error(e), () => globalStream.complete()
    );

    rxTestScheduler.expectObservable(result).toBe(main, mainVals);
    rxTestScheduler.expectObservable(sub1).toBe(expected1, {b: {action: "world", data: {}}});

    // Flush the tests which will run the deep compare
    rxTestScheduler.flush();
  });
});
