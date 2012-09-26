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
});
