'use strict';

var monster = exports;

var JSV = require('JSV').JSV;


monster.validator = JSV.createEnvironment();
monster.define = require('model');
monster.initialize = require('database');
monster.Collection = require('collection');
