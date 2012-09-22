'use strict';

var monster = exports;

var _ = require('underscore');
var Backbone = require('backbone');
var JSV = require('JSV').JSV;


monster.validator = JSV.createEnvironment();

monster.initialize = require('database');

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

        if (attributes._type !== undefined) {
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
        ['get', 'toJSON', 'clone'];
    _.extend(Model.prototype, _.pick(
        Backbone.Model.prototype,  whitelistedBackboneMethods));

    Model.prototype.escape = function (attr) {
        var val = this.get(attr);
        return _.escape(val == null ? '' : '' + val);
    };

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

    Model.prototype.clear = function (attr) {
        var self = this;
        _.each(this.attributes, function (value, key) {
            delete self.attributes[key];
        });
    };

    Model.prototype.id = function (attr) {
        return this.get('_id');
    };

    Model.prototype.rev = function (attr) {
        return this.get('_rev');
    };

    Model.prototype.isNew = function (attr) {
        return !this.get('_id') || !this.get('_rev');
    };

    Model.prototype.validate = function () {
        if (!options.schema) {
            return undefined;
        }

        var report = monster.validator.validate(
            this.attributes, options.schema);
        return report.errors.length ? report.errors : undefined;
    };

    Model.prototype.isValid = function () {
        return !this.validate();
    };

    return Model;
};
