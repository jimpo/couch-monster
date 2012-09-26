'use strict';

var monster = require('monster');

var _ = require('underscore');


describe('Collection', function () {
    var collection, Monster = monster.define('CollectionMonster');

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
                mock.expects('fetch')
                    .withArgs({keys: ['marvin', 'charlie']})
                    .yields(new Error);
                collection.fetch(function (err) {
                    done();
                });
            });

            it('should set model attributes with documents', function (done) {
                collection.push(new Monster('marvin'), new Monster('charlie'));
                sinon.spy(collection[0], 'set');
                sinon.spy(collection[1], 'set');

                var marvin = {
                    _id: 'marvin',
                    _rev: 'marvin-rev',
                };
                var charlie = {
                    _id: 'charlie',
                    _rev: 'charlie-rev',
                };

                mock.expects('fetch')
                    .withArgs({keys: ['marvin', 'charlie']})
                    .yields(null, {
                        rows: [{doc: marvin}, {doc: charlie}],
                    });
                collection.fetch(function (err) {
                    collection[0].set.should.have.been.calledWith(marvin);
                    collection[1].set.should.have.been.calledWith(charlie);
                    done(err);
                });
            });
        });

        describe('#save()', function () {
            it('should perform a bulk insertion of models', function (done) {
                var marvin = new Monster('marvin', {
                    scary: true,
                    location: 'couch',
                });
                collection.push(marvin);

                mock.expects('bulk')
                    .withArgs({docs: [{
                        _id: 'marvin',
                        type: 'CollectionMonster',
                        scary: true,
                        location: 'couch',
                    }]})
                    .yields(null, [{
                        id: 'marvin',
                        rev: 'rev',
                    }]);

                collection.save(function (err) {
                    marvin.rev().should.equal('rev');
                    done(err);
                });
            });

            it('should insert models without an id', function (done) {
                var marvin = new Monster({
                    scary: true,
                    location: 'couch',
                });
                collection.push(marvin);

                mock.expects('bulk')
                    .withArgs({docs: [{
                        type: 'CollectionMonster',
                        scary: true,
                        location: 'couch',
                    }]})
                    .yields(null, [{
                        id: 'marvin',
                        rev: 'rev',
                    }]);

                collection.save(function (err) {
                    marvin.id().should.equal('marvin');
                    marvin.rev().should.equal('rev');
                    done(err);
                });
            });

            it('should yield error if any document fails to save',
               function (done) {
                   var marvin = new Monster({
                       scary: true,
                       location: 'couch',
                   });
                   var collection = new monster.Collection([marvin]);

                   mock.expects('bulk')
                       .withArgs({docs: [{
                           type: 'CollectionMonster',
                           scary: true,
                           location: 'couch',
                       }]})
                       .yields(null, [{
                           id: "marvin",
                           error: "conflict",
                           reason: "Document update conflict.",
                       }]);

                   collection.save(function (err) {
                       err.should.be.an('Error');
                       done();
                   });
               });
        });
    });
});
