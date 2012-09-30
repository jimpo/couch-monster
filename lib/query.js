'use strict';

var monster = require('monster');


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
