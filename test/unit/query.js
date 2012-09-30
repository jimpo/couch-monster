'use strict';

var Query = require('query');

describe('Query', function () {
    describe('constructor', function () {
        it('should set options to constructor argument', function () {
            var options = {descending: true};
            var query = new Query(options);
            query.options.should.equal(options);
        });

        it('should set options to empty object otherwise', function () {
            var query = new Query();
            query.options.should.deep.equal({});
        });

        it('should set callback to constructor argument', function () {
            var callback = function () {};
            var query = new Query(null, callback);
            query.callback.should.equal(callback);
        });
    });
});
