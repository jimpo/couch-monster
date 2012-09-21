'use strict';

var monster = exports;


monster.define = function (name, options) {
    var constructor = function () {
        options.initialize.call(this);
    };

    // Create named constructor function
    return new Function("constructor",
                        "return function " + name + "(){ " +
                        "    constructor.call(this);" +
                        "}"
                       )(constructor);
};
