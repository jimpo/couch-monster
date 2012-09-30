'use strict';

var monster = require('monster');
var Query = require('query');


describe('Query', function () {
    var mock;

    beforeEach(function () {
        monster.db = {
            view: function(){},
        };
        mock = sinon.mock(monster.db);
    });

    afterEach(function () {
        mock.verify();
        mock.restore();
    });

    describe('constructor', function () {
        it('should set options to constructor argument', function () {
            var options = {descending: true};
            var query = new Query('design', 'view', options);
            query.options.should.equal(options);
        });

        it('should set options to empty object otherwise', function () {
            var query = new Query('design', 'view');
            query.options.should.deep.equal({});
        });

        it('should set options to empty object if options argument is omitted',
           function () {
               var query = new Query('design', 'view', function () {});
               query.options.should.deep.equal({});
           });

        it('should set callback to constructor argument', function () {
            var callback = function () {};
            var query = new Query('design', 'view', null, callback);
            query.callback.should.equal(callback);
        });
    });

    describe('execute', function () {
        it('should call db.view with design name, view, and options',
           function () {
               var query = new Query('design', 'view');
               mock.expects('view').withArgs('design', 'view', query.options)
                   .yields();
               query.execute(function () {});
           });

        it('should call argument callback', function (done) {
            var query = new Query();
            mock.expects('view').yields();
            query.execute(done); // If callback isn't called, test will time out
        });

        it('should call argument callback with transformed results',
           function (done) {
               var query = new Query('design', 'view', function (callback) {
                   return function (results) {
                       callback(results.toUpperCase());
                   };
               });
               mock.expects('view').yields('results');
               query.execute(function (results) {
                   results.should.equal('RESULTS');
                   done();
               });
           });
    });
});
