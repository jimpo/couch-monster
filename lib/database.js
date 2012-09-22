var monster = require('./monster');


module.exports = function (options, callback) {
    monster.db = 'blah';
    callback();
};
