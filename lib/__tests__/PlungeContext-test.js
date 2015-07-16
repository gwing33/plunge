import _ from 'lodash';

jest.autoMockOff();

describe('Plunge Context Tests', () => {

  it('Should Create a Context', (done) => {
    let Plunge = require('../Plunge');

    let store = Plunge.createContext({ name: 'test', uri: '/test/path'});
    expect(typeof store.get()).toBe('object');
    expect(_.size(store.get())).toBe(0);

    // This should not add the data or create a new context.
    store = Plunge.createContext({ name: 'test', uri: '/test/path', data: { foo: 'bar' }});
    expect(_.size(store.get())).toBe(0);

    // This should add the data and create a new Context
    store = Plunge.createContext({ name: 'test', uri: '/test/path', data: { foo: 'bar' }}, true);
    expect(typeof store.get()).toBe('object');
    expect(_.size(store.get())).toBe(1);
    expect(store.get().foo).toBe('bar');

    // Add Event, and test a Rebuild to make sure events match up.
    store.add({ foo: 'bars' });
    expect(store.get().foo).toBe('bars');
    expect(store.rebuild().foo).toBe('bars');

    // This will be called after the next add
    store.addChangeListener((cur, next) => {
      expect(cur.uri).toBe('/test/path');
      expect(cur.data.foo).toBe('bars');
      expect(next.data.foo).toBe('bar');
    });

    store.add({ foo: 'bar' });
    expect(store.get().foo).toBe('bar');
    expect(store.rebuild().foo).toBe('bar');
  });

  // Test API Calls

  // Test Plugin

});
