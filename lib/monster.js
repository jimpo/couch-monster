'use strict';

var monster = exports;

var _ = require('underscore');


monster.define = function (name, options) {
    options = options || {};

    var constructor = function (id, attributes) {
        attributes = attributes || {};
        if (_.isObject(id)) {
            attributes = id;
            id = undefined;
        }

        this.attributes = _.clone(attributes);
        if (id) {
            this.attributes._id = id;
        }

        if (options.initialize) {
            options.initialize.call(this);
        }
    };

    // Create named constructor function
    return new Function("constructor",
                        "return function " + name + "(){ " +
                        "    constructor.apply(this, arguments);" +
                        "}"
                       )(constructor);
};
