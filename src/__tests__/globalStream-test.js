jest.autoMockOff();

import {TestScheduler, ReactiveTest} from "rx";

const {globalStream} = require("../globalStream");

// Aliases
const {onNext, onCompleted} = ReactiveTest;

describe('Global Stream Tests', () => {
  it('Should send a message through the main pipeline', () => {
    const stream = globalStream.getStream();

    stream.subscribe((message) => {
      expect(message.topic).toBe('hello');
    });

    globalStream.doDispatch({topic: 'hello'});
  });

  it('Should testing manual dispatches of messages and specific types.', () => {
    const scheduler = new TestScheduler();
    globalStream.init(scheduler);

    scheduler.scheduleAbsolute({}, 300, () => {
      globalStream.doDispatch({topic: 'hello'});
      globalStream.doDispatch({topic: 'helloToo'});
    });

    scheduler.scheduleAbsolute({}, 500, () => {
      globalStream.doDispatch({topic: 'hello'});
    });

    const results = scheduler.startScheduler(() => {
      return globalStream.getStream();
    });

    expect (results.messages).toEqual([
        onNext(301, {topic: 'hello'}),
        onNext(302, {topic: 'helloToo'}),
        onNext(501, {topic: 'hello'})
    ]);
  });
});
