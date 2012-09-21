'use strict';

var monster = require('monster');


describe('monster', function () {
    describe('#define()', function () {
        var Monster;

        beforeEach(function () {
            Monster = monster.define('Monster');
        });

        it('should return a new constructor function', function () {
            Monster.should.be.a('function');
        });

        it('should return a function with name matching argument', function () {
            Monster.name.should.equal('Monster');
        });

        it('should set id to given id', function () {
            var marvin = new Monster('marvin');
            marvin.attributes._id.should.equal('marvin');
        });

        it('should initialize attributes to constructor argument', function () {
            var marvin = new Monster('marvin', {
                location: 'closet',
                scary: true,
            });
            marvin.attributes.should.deep.equal({
                _id: 'marvin',
                location: 'closet',
                scary: true,
            });
        });

        it('should initialize attributes to empty object otherwise',
           function () {
               var marvin = new Monster();
               expect(marvin.attributes).to.exist;
               marvin.attributes.should.deep.equal({});
           });

        it('should make attributes readonly', function () {
            var marvin = new Monster();
            var assignment = function () {
                marvin.attributes = {};
            };
            assignment.should.throw(TypeError, /read only/);
        });

        it('should make "type" attribute readonly', function () {
            var factory = function () {
                return new Monster({
                    type: 'blah',
                });
            };
            factory.should.throw(TypeError, /read only/);
        });

        it('constructor should call initialize on object', function () {
            var options = {
                initialize: sinon.spy(),
            };
            var Monster = monster.define('Monster', options);
            var marvin = new Monster('marvin');
            options.initialize.should.have.been.calledOn(marvin);
        });
    });
});
