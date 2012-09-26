'use strict';

var monster = require('./monster');

var _ = require('underscore');
var errs = require('errs');


var Collection = module.exports = function (models) {
    Array.apply(this);
    this.push.apply(this, models);
};

Collection.__super__ = [];
Collection.prototype = [];

var methods = [
    'forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
    'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray',
    'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'groupBy'
];

_.each(methods, function(method) {
    Collection.prototype[method] = function() {
        return _[method].apply(_, [this].concat(_.toArray(arguments)));
    };
});

Collection.prototype.pluck = function (attr) {
    return this.map(function (model) {
        return model.get(attr)
    });
};

Collection.prototype.fetch = function (callback) {
    var self = this;
    var docnames = {
        keys: this.pluck('_id'),
    };
    monster.db.fetch(docnames, {}, function (err, res) {
        if (err) return errs.handle(err, callback);
        for (var i = 0; i < self.length; i++) {
            self[i].set(res.rows[i].doc);
        }
        callback();
    });
};

Collection.prototype.save = function (callback) {
    var self = this;
    var documents = this.map(function (model) {
        var attributes = model.toJSON();
        attributes.type = model.constructor.name;
        return attributes;
    });
    monster.db.bulk({docs: documents}, {}, function (err, res) {
        if (err) return errs.handle(err, callback);
        for (var i = 0; i < self.length; i++) {
            if (res[i].error) {
                return errs.handle(_.extend(res[i], {
                    name: 'DatabaseError',
                    message: 'Error saving document',
                }), callback);
            }
            self[i].set({
                _id: res[i].id,
                _rev: res[i].rev,
            });
        }
        callback();
    });
};

Collection.prototype.destroy = function (callback) {
    this.each(function (model) {
        model.set('_deleted', true);
    });
    this.save(callback);
};