'use strict';

var monster = require('monster');

var _ = require('underscore');
var nock = require('nock');


describe('Model', function () {
    var marvin, Monster, scope;

    before(function (done) {
        Monster = monster.define('Monster');
        var options = {
            url: {
                protocol: 'https',
                hostname: 'tigerblood.cloudant.com',
                port: 443,
            },
            db: 'greggs-place',
            createDatabase: true,
        };
        nock('https://tigerblood.cloudant.com:443')
            .get('/greggs-place')
            .reply(200);
        monster.initialize(options, done);
    });

    beforeEach(function () {
        scope = nock('https://tigerblood.cloudant.com:443');
        marvin = new Monster('marvin', {
            scary: true,
            location: 'couch',
        });
    });

    describe('#exists()', function () {
        it('should yield revision if object exists', function (done) {
            scope
                .head('/greggs-place/marvin')
                .reply(200, "", {
                    etag: '"1-967a00dff5e02add41819138abb3284e"',
                });
            marvin.exists(function (err, revision) {
                revision.should.equal('1-967a00dff5e02add41819138abb3284e');
                scope.done();
                done(err);
            });
        });

        it("should be falsy if object doesn't exist", function (done) {
            scope
                .head('/greggs-place/marvin')
                .reply(404);
            marvin.exists(function (err, revision) {
                expect(revision).not.to.be.ok;
                scope.done();
                done(err);
            });
        });
    });

    describe('#fetch()', function () {
        it('should retrieve object from database', function (done) {
            var marvin = new Monster('marvin');
            var attributes = {
                _id: 'marvin',
                _rev: '1-967a00dff5e02add41819138abb3284e',
                scary: true,
                location: 'couch',
            };
            scope
                .get('/greggs-place/marvin')
                .reply(200, attributes);
            marvin.fetch(function (err) {
                marvin.attributes.should.deep.equal(attributes);
                done(err);
            });
        });
    });

    describe('#save()', function () {
        var res = {
            ok: true,
            id: 'marvin',
            rev: '1-967a00dff5e02add41819138abb3284e',
        };

        it('should save attributes with type', function (done) {
            var expected = marvin.toJSON();
            expected.type = 'Monster';

            scope
                .put('/greggs-place/marvin', expected)
                .reply(201, res);
            marvin.save(function (err) {
                scope.done();
                done(err);
            });
        });

        it('should set revision of model', function (done) {
            var expected = marvin.toJSON();
            expected.type = 'Monster';
            scope
                .put('/greggs-place/marvin', expected)
                .reply(201, res);
            marvin.save(function (err) {
                scope.done();
                marvin.get('_rev').should.equal(res.rev);
                done(err);
            });
        });

        it('should create without id', function (done) {
            marvin.unset('_id');

            var expected = marvin.toJSON();
            expected.type = 'Monster';

            var res = {
                ok: true,
                id: "1228bc02a12013ce083160bbe243e1d2",
                rev: "1-ec70d6c1f9ed04932f426bc44606e089",
            };
            scope
                .post('/greggs-place', expected)
                .reply(201, res);
            marvin.save(function (err) {
                scope.done();
                marvin.id().should.equal(res.id);
                done(err);
            });
        });

        it('should yield UniquenessError if id is taken', function(done) {
            var expected = marvin.toJSON();
            expected.type = 'Monster';
            scope
                .put('/greggs-place/marvin', expected)
                .reply(409, {
                    error: "conflict",
                    reason: "Document update conflict."
                });
            marvin.save(function (err) {
                err.name.should.equal('UniquenessError');
                err.message.should.equal('ID "marvin" already exists');
                done();
            });
        });
    });

    describe('#destroy()', function () {
        it('should delete with id and rev', function (done) {
            var res = {
                ok: true,
                id: 'marvin',
                rev: '1-967a00dff5e02add41819138abb3284e',
            };
            marvin.set('_rev', 'rev');
            scope
                .delete('/greggs-place/marvin?rev=' + marvin.rev())
                .reply(200, res);
            marvin.destroy(function (err) {
                marvin.id().should.equal('marvin');
                marvin.rev().should.equal(res.rev);
                marvin.get('_deleted').should.be.true;
                done(err);
            });
        });
    });

    describe('queries', function () {
        var Monster;

        before(function () {
            Monster = monster.define('QueryMonster', {
                views: {
                    byLocation: {},
                }
            });
        });

        describe('#getModel()', function () {
            it('should return model of fetched document', function (done) {
                var marvin = {
                    _id: 'marvin',
                    _rev: 'rev',
                    type: 'QueryMonster',
                    location: 'couch',
                };
                scope
                    .get('/greggs-place/_design/QueryMonster/_view/byLocation?key=%22couch%22&include_docs=true&limit=2')
                    .reply(200, {
                        total_rows: 1,
                        offset: 1,
                        rows: [{doc: marvin}],
                    });
                Monster.getModel('couch').byLocation(function (err, model) {
                    delete marvin.type;
                    model.should.be.an.instanceOf(Monster);
                    model.attributes.should.deep.equal(marvin);
                    done(err);
                });
            });

            it('should return yield nothing if no document is found',
               function (done) {
                   scope
                       .get('/greggs-place/_design/QueryMonster/_view/byLocation?key=%22couch%22&include_docs=true&limit=2')
                       .reply(200, {
                           total_rows: 0,
                           offset: 0,
                           rows: [],
                       });
                   Monster.getModel('couch').byLocation(function (err, model) {
                       expect(model).not.to.exist;
                       done(err);
                   });
               });

            it('should yield Error if view does not exist',
               function (done) {
                   var path = '/greggs-place/_design/QueryMonster/_view/' +
                       'byLocation?key=%22couch%22&include_docs=true&limit=2';

                   scope
                       .get(path)
                       .reply(404, {
                           error: "not_found",
                           reason: "missing"
                       });
                   Monster.getModel('couch').byLocation(function (err, model) {
                       scope.done();
                       err.should.be.an('Error');
                       err.status_code.should.equal(404);
                       done();
                   });
               });

            it('should return yield error if multiple documents found',
               function (done) {
                   scope
                       .get('/greggs-place/_design/QueryMonster/_view/byLocation?key=%22couch%22&include_docs=true&limit=2')
                       .reply(200, {
                           total_rows: 2,
                           offset: 2,
                           rows: [{doc: {}}, {doc: {}}],
                       });
                   Monster.getModel('couch').byLocation(function (err, model) {
                       expect(err).to.exist;
                       err.name.should.equal('ViewError');
                       err.message.should.equal('Multiple documents found');
                       done();
                   });
               });
        });

        describe('#getCollection()', function () {
            it('should return collection of fetched documents',
               function (done) {
                   var marvin = {
                       _id: 'marvin',
                       _rev: 'rev',
                       type: 'QueryMonster',
                       location: 'couch',
                   };
                   scope
                       .get('/greggs-place/_design/QueryMonster/_view/byLocation?include_docs=true')
                       .reply(200, {
                           total_rows: 2,
                           offset: 2,
                           rows: [{doc: marvin}, {doc: marvin}],
                       });
                   Monster.getCollection().byLocation(function (err, collection) {
                       delete marvin.type;
                       collection.length.should.equal(2);
                       collection.each(function (model) {
                           model.should.be.an.instanceOf(Monster);
                           model.attributes.should.deep.equal(marvin);
                       });
                       done(err);
                   });
               });

            it('should yield Error if view does not exist',
               function (done) {
                   scope
                       .get('/greggs-place/_design/QueryMonster/_view/byLocation?include_docs=true')
                       .reply(404, {
                           error: "not_found",
                           reason: "missing"
                       });
                   Monster.getCollection().byLocation(function (err, collection) {
                       scope.done();
                       err.should.be.an('Error');
                       err.status_code.should.equal(404);
                       done();
                   });
               });

            it('should return yield error if document\'s type is unknown',
               function (done) {
                   var marvin = {
                       _id: 'marvin',
                       _rev: 'rev',
                       type: 'UnknownMonster',
                       location: 'couch',
                   };
                   scope
                       .get('/greggs-place/_design/QueryMonster/_view/byLocation?include_docs=true')
                       .reply(200, {
                           total_rows: 2,
                           offset: 2,
                           rows: [{doc: marvin}, {doc: marvin}],
                       });
                   Monster.getCollection().byLocation(function (err, collection) {
                       expect(err).to.exist;
                       err.name.should.equal('ViewError');
                       err.message.should.equal(
                           'Unknown document type "UnknownMonster"');
                       done();
                   });
               });
        });
    });
});