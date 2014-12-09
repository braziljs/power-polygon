'use strict';

module.exports = {
	setUp: function(callback) {
        this.foo = 'bar';
        callback();
    },

	isNodeUnitWorking: function(test) {
		test.expect(2);
		test.ok(true, 'NodeUnit should be working');
		test.equal(this.foo, 'bar', 'Setup should be working');
		test.done();
	}
};