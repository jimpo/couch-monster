'use strict';

var monster = require('monster');


describe('monster', function () {
    describe('#define()', function () {
        it('should return a new constructor function', function () {
            monster.define('Monster').should.be.a('function');
        });

        it('should return a function with name matching argument', function () {
            monster.define('Monster').name.should.equal('Monster');
        });
    });

    describe('defined Monster', function () {
        var Monster, options;

        before(function () {
            options = {
                initialize: sinon.spy(),
            };
            Monster = monster.define('Monster', options);
        });

        it('should call initialize in constructor', function () {
            var marvin = new Monster('marvin');
            options.initialize.should.have.been.calledOn(marvin);
        });
    });
});