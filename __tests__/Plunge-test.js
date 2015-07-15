jest.autoMockOff();

describe('Plunge Tests', () => {
	it('Add some Events', () => {
		var Plunge = require('../lib/Plunge');
		var _ = require('lodash');

		expect(typeof Plunge.get('asdf')).toBe('object');
		expect(_.size(Plunge.get('asdf'))).toBe(0);

		Plunge.add('asdf', { isTest: true });

		expect(_.size(Plunge.get('asdf'))).toBe(1);
		expect(Plunge.get('asdf').isTest).toBe(true);
		expect(_.size(Plunge.getEvents('asdf'))).toBe(1);

		Plunge.add('asdf', { isTest: false });

		expect(_.size(Plunge.get('asdf'))).toBe(1);
		expect(Plunge.get('asdf').isTest).toBe(false);
		expect(_.size(Plunge.getEvents('asdf'))).toBe(2);

		Plunge.add('asdf', { isAnotherTest: true });

		expect(_.size(Plunge.get('asdf'))).toBe(2);
		expect(Plunge.get('asdf').isAnotherTest).toBe(true);
		expect(_.size(Plunge.getEvents('asdf'))).toBe(3);
	});

	it('Lets do some nesting', () => {
		var Plunge = require('../lib/Plunge');
		var _ = require('lodash');

		var obj = {};
		Plunge.nestObj(obj, { foo: 'bar' }, 'some/great/uri'.split('/'));
		expect(obj.some.great.uri.foo).toBe('bar');
	});
});
