'use strict';

var monster = require('monster');

var _ = require('underscore');


var Query = module.exports = function (design, options, callback) {
    this.design = design;

    if (arguments.length === 2 && typeof(arguments[1]) === 'function') {
        callback = options;
        options = undefined;
    }
    this.options = options || {};
    this.callback = callback || function (callback) {
        return callback;
    };
};

Query.prototype.execute = function (view, callback) {
    monster.db.view(this.design, view, this.options, this.callback(callback));
};

Query.prototype.key = function (key) {
    this.options.key = key;
    return this;
};

Query.prototype.keys = function () {
    this.options.keys = arguments.length == 1 ?
        arguments[0] : _.toArray(arguments);
    return this;
};

Query.prototype.start = function (key, id) {
    this.options.startkey = key;
    if (id) this.options.startkey_docid = id;
    return this;
};

Query.prototype.end = function (key, id) {
    this.options.endkey = key;
    if (id) this.options.endkey_docid = id;
    return this;
};

Query.prototype.limit = function (limit) {
    this.options.limit = limit;
    return this;
};

Query.prototype.stale = function () {
    this.options.stale = 'ok';
    return this;
};

Query.prototype.staleUpdateAfter = function () {
    this.options.stale = 'update_after';
    return this;
};

Query.prototype.descending = function () {
    this.options.descending = true;
    return this;
};

Query.prototype.skip = function (n) {
    this.options.skip = n;
    return this;
};

Query.prototype.group = function (level) {
    if (typeof(level) === 'number') {
        this.options.group_level = level;
    }
    else {
        this.options.group = true;
    }
    return this;
};

Query.prototype.reduce = function () {
    this.options.reduce = true;
    return this;
};

Query.prototype.includeDocs = function () {
    this.options.include_docs = true;
    return this;
};

Query.prototype.inclusiveEnd = function () {
    this.options.inclusive_end = true;
    return this;
};

Query.prototype.addView = function (view) {
    var self = this;
    this[view] = function (callback) {
        self.execute(view, callback);
    };
};