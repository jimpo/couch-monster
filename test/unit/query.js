'use strict';

var monster = require('monster');
var Query = require('query');


describe('Query', function () {
    describe('constructor', function () {
        it('should set options to constructor argument', function () {
            var options = {descending: true};
            var query = new Query('design', options);
            query.options.should.equal(options);
        });

        it('should set options to empty object otherwise', function () {
            var query = new Query('design');
            query.options.should.deep.equal({});
        });

        it('should set options to empty object if options argument is omitted',
           function () {
               var query = new Query('design', function () {});
               query.options.should.deep.equal({});
           });

        it('should set callback to constructor argument', function () {
            var callback = function () {};
            var query = new Query('design', null, callback);
            query.callback.should.equal(callback);
        });
    });

    describe('modifiers', function () {
        var query;

        beforeEach(function () {
            query = new Query;
        });

        describe('#key()', function () {
            it('should set key option to argument', function () {
                query.key('marvin').should.equal(query);
                query.options.key.should.equal('marvin');
            });
        });

        describe('#keys()', function () {
            it('should set keys option to arguments list', function () {
                query.keys('marvin', 'charlie').should.equal(query);
                query.options.keys.should.deep.equal(['marvin', 'charlie']);
            });

            it('should set keys option to array if one argument given',
               function () {
                   query.keys(['marvin', 'charlie']).should.equal(query);
                   query.options.keys.should.deep.equal(['marvin', 'charlie']);
               });
        });

        describe('#start()', function () {
            it('should set startkey option to first argument', function () {
                query.start('marvin').should.equal(query);
                query.options.startkey.should.equal('marvin');
            });

            it('should set startkey_docid if second argument given',
               function () {
                   query.start('marvin', '12345').should.equal(query);
                   query.options.startkey_docid.should.equal('12345');
               });
        });

        describe('#end()', function () {
            it('should set endkey option to first argument', function () {
                query.end('marvin').should.equal(query);
                query.options.endkey.should.equal('marvin');
            });

            it('should set endkey_docid if second argument given',
               function () {
                   query.end('marvin', '12345').should.equal(query);
                   query.options.endkey_docid.should.equal('12345');
               });
        });

        describe('#limit', function () {
            it('should set limit option to argument', function () {
                query.limit(5).should.equal(query);
                query.options.limit.should.equal(5);
            });
        });

        describe('#stale()', function () {
            it('should set stale option to ok', function () {
                query.stale().should.equal(query);
                query.options.stale.should.equal('ok');
            });
        });

        describe('#staleUpdateAfter()', function () {
            it('should set stale option to update_after', function () {
                query.staleUpdateAfter().should.equal(query);
                query.options.stale.should.equal('update_after');
            });
        });

        describe('#descending()', function () {
            it('should set descending option to true', function () {
                query.descending().should.equal(query);
                query.options.descending.should.be.true;
            });
        });

        describe('#skip()', function () {
            it('should set skip option to argument', function () {
                query.skip(5).should.equal(query);
                query.options.skip.should.equal(5);
            });
        });

        describe('#group()', function () {
            it('should set group option to true', function () {
                query.group().should.equal(query);
                query.options.group.should.be.true;
            });

            it('should set group_level option if integer given', function () {
                query.group(5).should.equal(query);
                query.options.should.not.have.property('group');
                query.options.group_level.should.equal(5);
            });
        });

        describe('#reduce()', function () {
            it('should set reduce option to true', function () {
                query.reduce().should.equal(query);
                query.options.reduce.should.be.true;
            });
        });

        describe('#includeDocs()', function () {
            it('should set include_docs option to true', function () {
                query.includeDocs().should.equal(query);
                query.options.include_docs.should.be.true;
            });
        });

        describe('#inclusiveEnd()', function () {
            it('should set inclusive_end option to true', function () {
                query.inclusiveEnd().should.equal(query);
                query.options.inclusive_end.should.be.true;
            });
        });
    });

    describe('#execute()', function () {
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

        it('should call db.view with design name, view, and options',
           function () {
               var query = new Query('design');
               mock.expects('view').withArgs('design', 'view', query.options)
                   .yields();
               query.execute('view', function () {});
           });

        it('should call argument callback', function (done) {
            var query = new Query();
            mock.expects('view').yields();
            // If callback isn't called, test will time out
            query.execute('view', done);
        });

        it('should call argument callback with transformed results',
           function (done) {
               var query = new Query('design', function (callback) {
                   return function (results) {
                       callback(results.toUpperCase());
                   };
               });
               mock.expects('view').yields('results');
               query.execute('view', function (results) {
                   results.should.equal('RESULTS');
                   done();
               });
           });
    });
});
