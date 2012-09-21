'use strict';

var monster = exports;

var _ = require('underscore');


monster.define = function (name, options) {
    options = options || {};

    var constructor = function (id, attributes) {
        if (_.isObject(id)) {
            attributes = id;
            id = undefined;
        }

        attributes = _.defaults(attributes || {}, options.defaults);

        if (id) {
            attributes._id = id;
        }

        Object.defineProperty(this, 'attributes', {
            value: {},
            writeable: false,
            enumerable: true,
        });
        Object.defineProperty(this.attributes, 'type', {
            enumerable: false,
            writeable: false,
        });

        if ('type' in attributes) {
            // Throws error here because of 'use strict'
            this.attributes.type = attributes.type;
        }
        _.extend(this.attributes, attributes);

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
