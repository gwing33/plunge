jest.autoMockOff();

describe('Plunge Tests', () => {
	it('Add some Events', () => {
		var Plunge = require('../Plunge');
		var _ = require('lodash');

		expect(typeof Plunge.getState('asdf')).toBe('object');
		expect(_.size(Plunge.getState('asdf'))).toBe(0);

		Plunge.add('asdf', { isTest: true });

		expect(_.size(Plunge.getState('asdf'))).toBe(1);
		expect(Plunge.getState('asdf').isTest).toBe(true);
		expect(_.size(Plunge.getEvents('asdf'))).toBe(1);

		Plunge.add('asdf', { isTest: false });

		expect(_.size(Plunge.getState('asdf'))).toBe(1);
		expect(Plunge.getState('asdf').isTest).toBe(false);
		expect(_.size(Plunge.getEvents('asdf'))).toBe(2);

		Plunge.add('asdf', { isAnotherTest: true });

		expect(_.size(Plunge.getState('asdf'))).toBe(2);
		expect(Plunge.getState('asdf').isAnotherTest).toBe(true);
		expect(_.size(Plunge.getEvents('asdf'))).toBe(3);
	});

	it('Lets do some nesting', () => {
		var Plunge = require('../Plunge');

		var obj = {};
		Plunge.nestObj(obj, { foo: 'bar' }, 'some/great/uri'.split('/'));
		expect(obj.some.great.uri.foo).toBe('bar');
	});

	it('Should make sure sub URI is formatted correctly', () => {
		var Plunge = require('../Plunge');

		let uris = Plunge.splitUri('/some/uri/', '/some/uri/with/sub/string');
		expect(uris.length).toBe(3);
		expect(uris[0]).toBe('with');
		expect(uris[1]).toBe('sub');
		expect(uris[2]).toBe('string');
	});

	it('Lets test some Sub Events', () => {
		var Plunge = require('../Plunge');
		var _ = require('lodash');
		var json = require('./fixtures/events.json');

		json.events.map(x => {
			Plunge.add(x.uri, x.data);
		});

		var data = Plunge.getState('/1');
		expect(data.hello).toBe('world1');

		data = Plunge.getState('/1', 0, true);
		expect(data[2][3][4][5][6][7].hello).toBe('world7');
	});
});
