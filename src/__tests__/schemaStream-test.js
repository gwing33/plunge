import {TestScheduler} from 'rxjs';
import {Map} from 'immutable';

const {schemaStream, createSchemaPayload} = require('../schemaStream');
const rxTestScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe('Schema Stream Tests', () => {
  it('Should send some messages but not update the schema', () => {
    const main     = '--a--b--c--|';
    const expected = '--------c--|';

    const expectedPayload = createSchemaPayload('user', Map({some: 'metadata'}));
    const mockData = {
      a: Map({foo: "bar"}),
      b: Map({action: "world"}),
      c: expectedPayload
    };
    const expectedData = {
      c: Map({'user': Map({some: 'metadata'})})
    };

    // Subscribe to the GS to start listening for values.
    rxTestScheduler.expectObservable(schemaStream).toBe(expected, expectedData);

    // TestObservable that redirects data to the GS
    const result = rxTestScheduler.createHotObservable(main, mockData).do(
      x => schemaStream.next(x), e => schemaStream.error(e), () => schemaStream.complete()
    );

    // Add TestObservable to the flush queue.
    rxTestScheduler.expectObservable(result).toBe(main, mockData);

    // Flush the tests which will run the deep compare
    rxTestScheduler.flush();
  });
});
