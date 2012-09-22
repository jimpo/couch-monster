var monster = require('./monster');

var _ = require('underscore');
var errs = require('errs');
var nanolib = require('nano');
var url = require('url');

var NONEXISTENT_DATABASE = 'Database does not exist.';


exports.initialize = function (options, callback) {
    var couchUrl = options.url;
    if (_.isObject(couchUrl)) {
        couchUrl = url.format(couchUrl);
    }
    var nano = exports.connect(couchUrl);

    nano.db.get(options.db, function (err) {
        if (err && err.message === NONEXISTENT_DATABASE &&
            options.createDatabase) {
            nano.db.create(options.db, function (err) {
                monster.db = nano.use(options.db);
                callback(err);
            });
        }
        else if (err) {
            errs.handle(err, callback);
        }
        else {
            monster.db = nano.use(options.db);
            callback();
        }
    });
};

exports.connect = function (couchUrl) {
    return nanolib(couchUrl);
};