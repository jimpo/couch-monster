'use strict';

var database = require('database');

var nanolib = require('nano');


describe('#initialize()', function () {
    it('should create nano object with string url', function () {
        sinon.spy(database, 'connect');
        var options = {
            url: 'https://couchmonster.com:443',
        };
        database.initialize(options, function (err) {
            expect(err).not.to.be.ok;
            database.connect.should.have.been.calledWith(
                'https://couchmonster.com:443');
            database.connect.restore();
        });
    });

    it('should create nano object with url parameters', function () {
        sinon.spy(database, 'connect');
        var options = {
            url: {
                protocol: 'https',
                hostname: 'couchmonster.com',
                port: 443,
            }
        };
        database.initialize(options, function (err) {
            expect(err).not.to.be.ok;
            database.connect.should.have.been.calledWith(
                'https://couchmonster.com:443');
            database.connect.restore();
        });
    });
});
