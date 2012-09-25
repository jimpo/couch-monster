'use strict';

var _ = require('underscore');


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
        return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
});
