import _ from 'lodash';

jest.autoMockOff();

describe('Plunge Context Tests', () => {

  it('Should Create a Context', (done) => {
    let Plunge = require('../Plunge');

    let store = Plunge.createContext({ name: 'test', uri: '/test/path'});
    expect(typeof store.getState()).toBe('object');
    expect(_.size(store.getState())).toBe(0);

    // This should not add the data or create a new context.
    store = Plunge.createContext({ name: 'test', uri: '/test/path', data: { foo: 'bar' }});
    expect(_.size(store.getState())).toBe(0);

    // This should add the data and create a new Context
    store = Plunge.createContext({ name: 'test', uri: '/test/path', data: { foo: 'bar' }}, true);
    expect(typeof store.getState()).toBe('object');
    expect(_.size(store.getState())).toBe(1);
    expect(store.getState().foo).toBe('bar');

    // Add Event, and test a Rebuild to make sure events match up.
    store.add({ foo: 'bars' });
    expect(store.getState().foo).toBe('bars');
    expect(store.rebuild().foo).toBe('bars');

    // This will be called after the next add
    store.addChangeListener((data, prevData) => {
      expect(prevData.uri).toBe('/test/path');
      expect(prevData.data.foo).toBe('bars');
      expect(data.data.foo).toBe('bar');
    });

    store.add({ foo: 'bar' });
    expect(store.getState().foo).toBe('bar');
    expect(store.rebuild().foo).toBe('bar');

    store.removeChangeListener('/test/path');
    // This would fail with the previous listener I added
    store.add({ foo: 'barz' });

    store.addChangeListeners([{
      uri: '/new/test/path',
      onChange: (data, prevData) => {
        expect(_.size(prevData.data)).toBe(0);
        expect(data.data.hello).toBe('world');
      }
    }, (data, prevData) => {
      expect(prevData.data.foo).toBe('barz');
      expect(data.data.foo).toBe('bar');
    }]);

    store.add({ foo: 'bar' });

    let newStore = Plunge.createContext({ name: 'asdf', uri: '/new/test/path' });
    newStore.add({ hello: 'world' });
    expect(newStore.getState().hello).toBe('world');

  });

});
