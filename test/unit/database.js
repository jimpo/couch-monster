'use strict';

var database = require('database');

var nanolib = require('nano');


describe('#initialize()', function () {
    var nano, connect;

    beforeEach(function () {
        nano = nanolib('https://couchmonster.com:443');
        sinon.stub(database, 'connect').returns(nano);
    });

    afterEach(function () {
        database.connect.restore();
    });

    it('should create nano object with string url', function (done) {
        var options = {
            url: 'https://couchmonster.com:443',
        };
        database.initialize(options, function (err) {
            database.connect.should.have.been.calledWith(
                'https://couchmonster.com:443');
            done();
        });
    });

    it('should create nano object with url parameters', function (done) {
        var options = {
            url: {
                protocol: 'https',
                hostname: 'couchmonster.com',
                port: 443,
            }
        };
        sinon.stub(nano.db, 'get').yields('error');
        database.initialize(options, function (err) {
            database.connect.should.have.been.calledWith(
                'https://couchmonster.com:443');
            nano.db.get.restore();
            done();
        });
    });

    it('should check if the database exists', function (done) {
        var mock = sinon.mock(nano.db);
        mock.expects('get').withArgs('marvin').yields();
        database.initialize({name: 'marvin'}, function (err) {
            mock.verify();
            done(err);
        });
    });

    it('should create database if it does not exist and option set',
       function (done) {
           var options = {
               name: 'marvin',
               createDatabase: true,
           };
           sinon.stub(nano.db, 'get').yields(
               new Error('Database does not exist.'));
           var mock = sinon.mock(nano.db);
           mock.expects('create').withArgs(options.name).yields();
           database.initialize(options, function (err) {
               mock.verify();
               done(err);
           });
       });

    it('should not create database if option is not set', function (done) {
        var options = {
            name: 'marvin',
        };
        sinon.stub(nano.db, 'get').yields(
            new Error('Database does not exist.'));
        var mock = sinon.mock(nano.db);
        mock.expects('create').never();
        database.initialize(options, function (err) {
            expect(err).to.exist;
            err.message.should.equal('Database does not exist.');
            mock.verify();
            done();
        });
    });
});
