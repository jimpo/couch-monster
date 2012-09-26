'use strict';

var monster = require('monster');

var _ = require('underscore');
var nock = require('nock');


describe('#initialize()', function () {
    var options;

    beforeEach(function () {
        options = {
            url: {
                protocol: 'https',
                hostname: 'cloudant.com',
                port: 443,
            },
            db: 'greggs-place',
        };
    });

    it('should check if the database exists', function (done) {
        var couchdb = nock('https://cloudant.com:443')
            .get('/greggs-place').reply();
        monster.initialize(options, function () {
            couchdb.done();
            done();
        });
    });

    it('should create database if it does not exist and option set',
       function (done) {
           var couchdb = nock('https://cloudant.com:443')
               .get('/greggs-place')
               .reply(404, {
                   error: "not_found",
                   reason: "Database does not exist."
               });
           couchdb
               .put('/greggs-place')
               .reply(201, {ok: true});
           options.createDatabase = true;
           monster.initialize(options, function (err) {
               couchdb.done();
               done(err);
           });
       });

    it('should not create database if option is not set', function (done) {
        var couchdb = nock('https://cloudant.com:443')
            .get('/greggs-place')
            .reply(404, {
                error: "not_found",
                reason: "Database does not exist."
            });
        monster.initialize(options, function (err) {
            err.message.should.equal('Database does not exist.');
            couchdb.done();
            done();
        });
    });
});
