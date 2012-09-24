'use strict';

var monster = require('./monster');

var _ = require('underscore');
var Backbone = require('backbone');
var errs = require('errs');


module.exports = function (name, options) {
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

    Model.prototype.exists = function (callback) {
        if (!this.id()) return errs.handle({
            message: 'Model cannot exist without id',
        }, callback);
        monster.db.head(this.id(), function (err, undefined_body, headers) {
            if (err && err.status_code === 404) {
                callback();
            }
            else if (err) {
                errs.handle(err, callback);
            }
            else {
                var revision = headers.etag.replace(/"/g, '');
                callback(null, revision);
            }
        });
    };

    Model.prototype.fetch = function (callback) {
        var self = this;
        if (!this.id()) return errs.handle({
            message: 'Cannot fetch model without id',
        }, handle);
        monster.db.get(this.id(), function (err, res) {
            if (err) return errs.handle(err, callback);
            self.clear();
            self.set(res);
            callback();
        });
    };

    Model.prototype.save = function (callback) {
        var errors = this.validate();
        if (errors) {
            return errs.handle({
                name: 'ValidationError',
                errors: errors,
            }, callback);
        }

        var self = this;
        var attributes = this.toJSON();
        attributes._type = this.constructor.name;
        monster.db.insert(attributes, this.id(), function (err, res) {
            if (err && self.isNew() && err.status_code === 409) {
                return errs.handle({
                    name: 'UniquenessError',
                    message: 'ID "' + self.id() + '" already exists',
                }, callback);
            }
            else if (err) {
                return errs.handle(err, callback);
            }
            else if (!res.ok) {
                return errs.handle(res, callback);
            }
            else {
                self.set({
                    _id: res._id,
                    _rev: res._rev,
                });
                callback();
            }
        });
    };

    return Model;
};
