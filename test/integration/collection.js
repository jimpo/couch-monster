'use strict';

var monster = require('monster');

var nock = require('nock');


describe('Collection', function () {
    var marvin, Monster;

    before(function (done) {
        Monster = monster.define('CollectionMonster');
        var options = {
            url: {
                protocol: 'https',
                hostname: 'tigerblood.cloudant.com',
                port: 443,
                auth: 'tigerblood:legacy',
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
        marvin = new Monster('marvin', {
            scary: true,
            location: 'couch',
        });
    });

    describe('#fetch()', function () {
        var res = {
            total_rows: 4,
            offset: 0,
            rows: [{
                id: "marvin",
                key: "marvin",
                value: {
                    rev: "6-3a42a3e583d5c6ead5a9c0053351acea"
                },
                doc: {
                    _id: "marvin",
                    _rev: "6-3a42a3e583d5c6ead5a9c0053351acea"
                }
            }],
        };

        it('should fetch models', function (done) {
            var marvin = new Monster('marvin');
            var collection = new monster.Collection([marvin]);

            var couchdb = nock('https://tigerblood.cloudant.com:443')
                .post('/greggs-place/_all_docs?include_docs=true',
                      {keys: ["marvin"]})
                .reply(200, res);
            collection.fetch(function (err) {
                couchdb.done();
                done(err);
            });
        });
    });

    describe('#save()', function () {
        it('should perform a bulk insertion of models', function (done) {
            var marvin = new Monster('marvin');
            var collection = new monster.Collection([marvin]);

            var couchdb = nock('https://tigerblood.cloudant.com:443')
                .post('/greggs-place/_bulk_docs', {
                    docs: [
                        {_id: 'marvin', type: 'CollectionMonster'},
                    ]})
                .reply(201, [{
                    id: "marvin",
                    rev: "1-967a00dff5e02add41819138abb3284d",
                }]);

            collection.save(function (err) {
                couchdb.done();
                marvin.rev().should.equal(
                    '1-967a00dff5e02add41819138abb3284d');
                done(err);
            });
        });

        it('should insert models without an id', function (done) {
            var marvin = new Monster('marvin');
            var collection = new monster.Collection([marvin, new Monster]);

            var couchdb = nock('https://tigerblood.cloudant.com:443')
                .post('/greggs-place/_bulk_docs', {
                    docs: [
                        {_id: 'marvin', type: 'CollectionMonster'},
                        {type: 'CollectionMonster'},
                    ]})
                .reply(201, [
                    {
                        id: "marvin",
                        rev: "1-967a00dff5e02add41819138abb3284d",
                    },
                    {
                        id: "518fd93e9791133ca98f8e62d32aaf6d",
                        rev: "1-52902b3d705970ee6724c682cb4feab5"
                    }
                ]);

            collection.save(function (err) {
                couchdb.done();
                collection[1].id().should.equal(
                    '518fd93e9791133ca98f8e62d32aaf6d');
                collection[1].rev().should.equal(
                    '1-52902b3d705970ee6724c682cb4feab5');
                done(err);
            });
        });

        it('should yield error if any document fails to save', function (done) {
            var marvin = new Monster('marvin');
            var collection = new monster.Collection([marvin]);

            nock('https://tigerblood.cloudant.com:443')
                .post('/greggs-place/_bulk_docs', {
                    docs: [
                        {_id: 'marvin', type: 'CollectionMonster'},
                    ]})
                .reply(201, [
                    {
                        id: "marvin",
                        error: "conflict",
                        reason: "Document update conflict.",
                    }
                ]);
            collection.save(function (err) {
                err.should.be.an('Error');
                done();
            });
        });
    });

    describe('#destroy()', function () {
        it('should perform a bulk deletion of models', function (done) {
            var marvin = new Monster('marvin', {
                _rev: '1-967a00dff5e02add41819138abb3284d',
            });
            var collection = new monster.Collection([marvin]);

            var couchdb = nock('https://tigerblood.cloudant.com:443')
                .post('/greggs-place/_bulk_docs', {
                    docs: [
                        {
                            _rev: '1-967a00dff5e02add41819138abb3284d',
                            _id: 'marvin',
                            _deleted: true,
                            type: 'CollectionMonster',
                        },
                    ]})
                .reply(201, [{
                    id: "marvin",
                    rev: "2-453987c64547392a7a21d035cc33535e",
                }]);

            collection.destroy(function (err) {
                couchdb.done();
                done(err);
            });
        });
    });
});
