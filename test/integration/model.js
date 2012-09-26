'use strict';

var monster = require('monster');

var nock = require('nock');


describe('Model', function () {
    var marvin, Monster;

    before(function (done) {
        Monster = monster.define('Monster');
        var options = {
            url: {
                protocol: 'https',
                hostname: 'cloudant.com',
                port: 443,
            },
            db: 'greggs-place',
            createDatabase: true,
        };
        nock('https://cloudant.com:443')
            .get('/greggs-place')
            .reply(200);
        monster.initialize(options, done);
    });

    beforeEach(function () {
        marvin = new Monster('marvin', {
            scary: true,
            location: 'couch',
        });
    });

    describe('#exists()', function () {
        it('should yield revision if object exists', function (done) {
            var couchdb = nock('https://cloudant.com:443')
                .head('/greggs-place/marvin')
                .reply(200, "", {
                    etag: '"1-967a00dff5e02add41819138abb3284e"',
                });
            marvin.exists(function (err, revision) {
                revision.should.equal('1-967a00dff5e02add41819138abb3284e');
                couchdb.done();
                done(err);
            });
        });

        it("should be falsy if object doesn't exist", function (done) {
            var couchdb = nock('https://cloudant.com:443')
                .head('/greggs-place/marvin')
                .reply(404);
            marvin.exists(function (err, revision) {
                expect(revision).not.to.be.ok;
                couchdb.done();
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
            var couchdb = nock('https://cloudant.com:443')
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

            var couchdb = nock('https://cloudant.com:443')
                .put('/greggs-place/marvin', expected)
                .reply(201, res);
            marvin.save(function (err) {
                couchdb.done();
                done(err);
            });
        });

        it('should set revision of model', function (done) {
            var expected = marvin.toJSON();
            expected.type = 'Monster';
            nock('https://cloudant.com:443')
                .put('/greggs-place/marvin', expected)
                .reply(201, res);
            marvin.save(function (err) {
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
            var couchdb = nock('https://cloudant.com:443')
                .post('/greggs-place', expected)
                .reply(201, res);
            marvin.save(function (err) {
                couchdb.done();
                marvin.id().should.equal(res.id);
                done(err);
            });
        });

        it('should yield UniquenessError if id is taken', function(done) {
            var expected = marvin.toJSON();
            expected.type = 'Monster';
            nock('https://cloudant.com:443')
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
            var couchdb = nock('https://cloudant.com:443')
                .delete('/greggs-place/marvin?rev=' + marvin.rev())
                .reply(200, res);
            marvin.destroy(function (err) {
                couchdb.done();
                marvin.id().should.equal('marvin');
                marvin.rev().should.equal(res.rev);
                marvin.get('_deleted').should.be.true;
                done(err);
            });
        });
    });
});