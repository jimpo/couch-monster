'use strict';

var _ = require('underscore');


var Collection = module.exports = function (models) {
    Array.apply(this);
    this.push.apply(this, models);
};

Collection.__super__ = [];
Collection.prototype = [];
