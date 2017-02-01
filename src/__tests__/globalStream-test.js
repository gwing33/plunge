import {TestScheduler} from 'rxjs';

const {globalStream} = require('../globalStream');
const rxTestScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe('Global Stream Tests', () => {
  it('Should send some messages through globalStream', () => {
    /* * *
     * Our goal is to send 3 events into the globalStream (GS). In order to do
     * that, we need to add an initinal observable that actually sends the data to GS.
     *
     * Mock Data --> TestObservable --> GS --> expected output
     *
     * Before we set up the TestObservable, we need to subscribe to the GS.
     * Nothing will be kicked off until we run the `flush`.
     */

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

    // Subscribe to the GS to start listening for values.
    rxTestScheduler.expectObservable(globalStream).toBe(expected, expectedVals);

    // TestObservable that redirects data to the GS
    const result = rxTestScheduler.createHotObservable(main, mainVals).do(
      x => globalStream.next(x), e => globalStream.error(e), () => globalStream.complete()
    );

    // Add TestObservable to the flush queue.
    rxTestScheduler.expectObservable(result).toBe(main, mainVals);

    // Flush the tests which will run the deep compare
    rxTestScheduler.flush();
  });
});
