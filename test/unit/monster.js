'use strict';

var monster = require('monster');


describe('monster', function () {
    describe('#define()', function () {
        it('should return a new constructor function', function () {
            monster.define('Monster').should.be.a('function');
        });
    });
});