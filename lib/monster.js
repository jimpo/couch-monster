'use strict';

var monster = exports;

var _ = require('underscore');
var Backbone = require('backbone');


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
        Object.defineProperty(this.attributes, '_type', {
            enumerable: false,
            writeable: false,
        });

        if ('_type' in attributes) {
            // Throws error here because of 'use strict'
            this.attributes._type = attributes._type;
        }
        this.set(attributes);

        if (options.initialize) {
            options.initialize.call(this);
        }
    };

    // Create named constructor function
    var Model = new Function("constructor",
                             "return function " + name + "(){ " +
                             "    constructor.apply(this, arguments);" +
                             "}"
                            )(constructor);

    var whitelistedBackboneMethods =
        ['get'];
    _.extend(Model.prototype, _.pick(
        Backbone.Model.prototype,  whitelistedBackboneMethods));

    Model.prototype.set = function (attr, value) {
        if (arguments.length == 1) {
            var newAttributes = attr;
            _.extend(this.attributes, newAttributes);
        }
        else {
            this.attributes[attr] = value;
        }
    };

    Model.prototype.has = function (attr) {
        return (attr in this.attributes);
    };

    Model.prototype.unset = function (attr) {
        if (this.has(attr)) {
            delete this.attributes[attr];
            return true;
        }
        return false;
    };

    return Model;
};
