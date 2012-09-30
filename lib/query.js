'use strict';

var monster = require('monster');

var _ = require('underscore');


var Query = module.exports = function (design, view, options, callback) {
    this.design = design;
    this.view = view;

    if (arguments.length === 3 && typeof(arguments[2]) === 'function') {
        callback = options;
        options = undefined;
    }
    this.options = options || {};
    this.callback = callback || function (callback) {
        return callback;
    };
};

Query.prototype.execute = function (callback) {
    monster.db.view(this.design, this.view, this.options, this.callback(callback));
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
