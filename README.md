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

**updateDesign**: Optional flag which, if true, will cause a design document to be generated for each type of model defined with the views for that model.

## Models

Couch Monster lets you define classes for different types of documents you want to store. Models are the primary way of interacting with documents.

``` js
var Monster = monster.define('Monster', {
    schema: {
        location: {
            type: 'string',
            required: 'true',
        }
    }
});

var marvin = new Monster('marvin');
marvin.fetch(function (err) {
    marvin.set('location', 'couch');
    marvin.save(function (err) {
        // Callback
    });
});
```

### monster.define(name, options)

This creates a new model class and returns it. The `name` parameter is the class name and is stored in every document of that class in the `type` field. `options` is an optional object with the following possible properties:

**defaults**: Default attributes values that each model will have unless overwritten.

**initialize**: Initialization function that will be called from constructor in the context of the model.

**schema**: A JSON schema for model attributes. Schema is used to validate model before saving. The schema for each property is in the [json-schema-draft-03](http://tools.ietf.org/html/draft-zyp-json-schema-03) format.

**views**: An object with the CouchDB views for this class's design document. If `monster.initialize` is called with the `updateDesign` option, a design document with this class name will be saved containing these views. `map` and `reduce` can be defined as functions as opposed to strings.

### Constructor

The constructor function takes an id and initial set of attributes. Both parameters are optional. The class's `initialize` function will be called from the constructor in the context of the new object (ie. in the invocation of the function, `this` will be the model).

### Model#get(attr)

Returns the model's attribute with the name `attr`.

### Model#set(attr, value)
### Model#set(attributes)

Set the property `attr` to `value`. In the second method of invoking `set`, the model's attributes will be extended with the passed in attributes.

**Note**: The attribute "`type`" is protected and cannot be set since it contains the model's class name in the database.

### Model#has(attr)

Returns boolean indicating whether the model has the given attribute.

### Model#unset(attr)

Removes the attribute `attr` from the model.

### Model#clear()

Removes all attributes from the model.

### Model#id()

Returns the model's id if it has one. This is the `_id` attribute.

### Model#rev()

Returns the model's revision if it has been saved. This is the `_rev` attribute.

### Model#isNew()

Returns boolean indicating whether the model has been saved to the database yet. It is assumed to be new if it does not have both an id and revision.

### Model#validate()

If model is invalid according the the class schema, this will return an array of errors. If model is valid, this returns `undefined`.

### Model#isValid()

Returns boolean indicating if model is valid using the `validate()` function.

### Model#exists(callback)

Checks if model with this id exists in the database. Yields `err` and `revision` arguments to callback function, where `revision` is the latest revision of the model or undefined if model does not exist. The `_rev` attribute of the model is *not* set.

### Model#fetch(callback)

Fetches the document using the `_id` attribute from the database and replaces the model's attributes with the document's. `fetch()` yields an error to the callback.

### Model#save(callback)

Saves this model as a document. The document will not be saved if it is not valid, using the `validate()` method. The saved document will have all of the model's attributes, as well as the "`type`" field set to the model's class name. A model saved without an id will have an id automatically generated by the database. After the `save` method calls back, the `_id` and `_rev` attributes will be set to the values of the document.

### Model#destroy(callback)

Deletes the document from the database. The model must have `_id` and `_rev` attributes to be deleted. Once the method calls back, the model's `_deleted` attribute will be set to `true` and the model's revision will be set to the revision of the deleted document.

## Collections

## Querying


