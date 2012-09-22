var monster = require('./monster');

var _ = require('underscore');
var errs = require('errs');
var nanolib = require('nano');
var url = require('url');


exports.initialize = function (options, callback) {
    var couchUrl = options.url;
    if (_.isObject(couchUrl)) {
        couchUrl = url.format(couchUrl);
    }
    var nano = exports.connect(couchUrl);

    callback();
};

exports.connect = function (couchUrl) {
    return nanolib(couchUrl);
};