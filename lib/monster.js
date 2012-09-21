'use strict';

var monster = exports;


monster.define = function (name) {
    return new Function(
        "return function " + name + "(){}"
    )();
};
