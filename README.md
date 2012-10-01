# Couch Monster

Take control of those unruly monsters in your database.

Couch Monster is a CouchDB document modeling system for Node.js. It provides ways to define model classes, collections of models, and easy querying using the CouchDB view API.

## Initialization

Monster has an asynchronous initialization function that must be called *after* defining all models but *before* using the models. This function will store the database information and optionally perform some initialization actions. It can be envoked with:

``` js
var monster = require('couch-monster');

var options = {
    url: "https://marvin:password@couch.monster.com:443",
    db: "database-name",
};
monster.initialize(options, function (err) {
    // Run application
});
```

### Options
**url**: Either a string with the CouchDB URL or an object that can be [formatted](http://nodejs.org/api/url.html#url_url_format_urlobj) using the Node.js `url` library.

**db**: The name of the database.

**createDatabase**: Optional flag which, if true, will cause the database to be created on the CouchDB instance if it does not already exist.

**updateViews**: Optional flag which, if true, will cause a design document to be generated for each type of model defined with the views for that model.

<a name="a2"/>
## Models

<a name="a3"/>
## Collections

<a name="a4"/>
## Querying


