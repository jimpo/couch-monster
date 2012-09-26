'use strict';

var monster = exports;

var JSV = require('JSV').JSV;


monster.models = {};
monster.validator = JSV.createEnvironment();
monster.define = require('./model');
monster.initialize = require('./database').initialize;
monster.Collection = require('./collection');
