'use strict';

var monster = require('monster');


describe('Collection', function () {
    var collection, Monster = monster.define('Monster');

    beforeEach(function () {
        collection = new monster.Collection();
    });

    describe('constructor', function () {
        it('should be an Array', function () {
            collection.should.be.an.instanceOf(Array);
        });

        it('should add constructor argument models', function () {
            var marvin = new Monster('marvin');
            collection = new monster.Collection([marvin, marvin]);
            console.log(collection);
            collection[1].should.equal(marvin);
        });
    });
});
