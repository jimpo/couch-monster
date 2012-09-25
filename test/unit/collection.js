'use strict';

var monster = require('monster');

var _ = require('underscore');


describe('Collection', function () {
    var collection, Monster = monster.define('Monster');

    beforeEach(function () {
        collection = new monster.Collection();
    });

    describe('constructor', function () {
        it('should be an Array', function () {
            collection.should.be.an.instanceOf(Array);
        });

        it('should add constructor argument models', function () {
            var marvin = new Monster('marvin');
            collection = new monster.Collection([marvin, marvin]);
            collection[1].should.equal(marvin);
        });
    });

    it('should respond to underscore methods', function () {
        var methods = [
            'forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
            'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
            'include', 'contains', 'invoke', 'max', 'min', 'sortBy',
            'sortedIndex', 'toArray', 'size', 'first', 'initial', 'rest',
            'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty',
            'groupBy'
        ];
        _.each(methods, function (method) {
            collection.should.respondTo(method);
        });
    });

    describe('#pluck()', function () {
        it('should return list of attributes from models', function () {
            collection.push(new Monster({name: 'marvin'}));
            collection.push(new Monster({name: 'charlie'}));
            collection.pluck('name').should.deep.equal(['marvin', 'charlie']);
        });
    });

    describe('persistence', function () {
        var mock;

        beforeEach(function () {
            monster.db = {
                fetch: function(){},
                bulk: function(){},
            };
            mock = sinon.mock(monster.db);
        });

        afterEach(function () {
            mock.verify();
            mock.restore();
        });

        describe('#fetch()', function () {
            it('should make bulk fetch call with model ids', function (done) {
                collection.push(new Monster('marvin'), new Monster('charlie'));
                mock.expects('fetch').withArgs(['marvin', 'charlie'])
                    .yields(null);
                collection.fetch(done);
            });
        });
    });
});
