'use strict';

var monster = require('monster');

var errs = require('errs');


describe('#define()', function () {
    var Monster;

    before(function () {
        Monster = monster.define('Monster');
    });

    it('should return a new constructor function', function () {
        Monster.should.be.a('function');
    });

    it('should return a function with name matching argument', function () {
        Monster.name.should.equal('Monster');
    });

    describe('constructor', function () {
        it('should set id to given id', function () {
            var marvin = new Monster('marvin');
            marvin.attributes._id.should.equal('marvin');
        });

        it('should initialize attributes to constructor argument', function () {
            var marvin = new Monster('marvin', {
                location: 'couch',
                scary: true,
            });
            marvin.attributes.should.deep.equal({
                _id: 'marvin',
                location: 'couch',
                scary: true,
            });
        });

        it('should initialize attributes to empty object otherwise',
           function () {
               var marvin = new Monster();
               expect(marvin.attributes).to.exist;
               marvin.attributes.should.deep.equal({});
           });

        it('should make attributes readonly', function () {
            var marvin = new Monster();
            var assignment = function () {
                marvin.attributes = {};
            };
            assignment.should.throw(TypeError, /read only/);
        });

        it('should make "_type" attribute readonly', function () {
            var factory = function () {
                return new Monster({
                    _type: 'Not Monster',
                });
            };
            factory.should.throw(TypeError, /read only/);
        });

        it('should call initialize on object', function () {
            var options = {
                initialize: sinon.spy(),
            };
            var Monster = monster.define('Monster', options);
            var marvin = new Monster('marvin');
            options.initialize.should.have.been.calledOn(marvin);
        });

        it('should set attributes to default values', function () {
            var Monster = monster.define('Monster', {
                defaults: {
                    location: 'couch',
                    scary: false,
                }
            });
            var marvin = new Monster();
            marvin.attributes.should.deep.equal({
                location: 'couch',
                scary: false,
            });
        });

        it('should not overwrite given attributes with defaults', function () {
            var Monster = monster.define('Monster', {
                defaults: {
                    location: 'couch',
                    scary: false,
                }
            });
            var marvin = new Monster({
                scary: true,
                teeth: 'sharp',
            });
            marvin.attributes.should.deep.equal({
                location: 'couch',
                scary: true,
                teeth: 'sharp',
            });
        });
    });

    describe('Model', function () {
        var marvin;

        beforeEach(function () {
            marvin = new Monster('marvin', {
                scary: true,
                location: 'couch',
            });
        });

        describe('#toJSON()', function () {
            it('should be a clone of model attributes', function () {
                var json = marvin.toJSON();
                json.should.not.equal(marvin.attributes);
                json.should.deep.equal(marvin.attributes);
            });
        });

        describe('#clone()', function () {
            it('should be a clone of the model', function () {
                var clone = marvin.clone();
                clone.should.not.equal(marvin);
                clone.should.deep.equal(marvin);
            });
        });

        describe('#get()', function () {
            it('should return attribute if present', function () {
                expect(marvin.get('scary')).to.exist;
                marvin.get('scary').should.equal(true);
            });

            it('should return undefined unless present', function () {
                expect(marvin.get('fake field')).not.to.exist;
            });
        });

        describe('#set()', function () {
            it('should set attributes given an object', function () {
                marvin.set({
                    teeth: 'sharp',
                    friendly: true,
                });
                marvin.attributes.teeth.should.equal('sharp');
                marvin.attributes.friendly.should.equal(true);
            });

            it('should override old attributes', function () {
                marvin.set({scary: false});
                marvin.attributes.scary.should.equal(false);
            });

            it('should keep old attributes', function () {
                marvin.set({
                    teeth: 'sharp',
                    friendly: true,
                });
                marvin.attributes.location.should.equal('couch');
            });

            it('should set one attribute given key and value', function () {
                marvin.set('friendly', true);
                marvin.attributes.friendly.should.equal(true);
            });
        });

        describe('#has()', function () {
            it('should be true if attribute exists', function () {
                marvin.attributes.friendly = undefined;
                marvin.has('friendly').should.be.true;
            });

            it('should be false if attribute does not exist', function () {
                marvin.has('friendly').should.be.false;
            });
        });

        describe('#unset()', function () {
            it('should clear attribute and return true', function () {
                marvin.unset('location').should.be.true;
                marvin.attributes.should.not.have.property('location');
            });

            it('should be false on nonexistent attribute', function () {
                marvin.unset('fake attribute').should.be.false;
            });
        });

        describe('#clear()', function () {
            it('should delete all attributes', function () {
                marvin.clear();
                marvin.attributes.should.be.empty;
            });
        });

        describe('#id()', function () {
            it('should return the _id attribute', function () {
                marvin.id().should.equal('marvin');
            });
        });

        describe('#rev()', function () {
            it('should return the _rev attribute', function () {
                marvin.set('_rev', 'rev');
                marvin.rev().should.equal('rev');
            });
        });

        describe('#isNew()', function () {
            it('should be true unless model has rev', function () {
                marvin.isNew().should.be.true;
            });

            it('should be true unless model has id', function () {
                marvin = new Monster({_rev: 'rev'});
                marvin.isNew().should.be.true;
            });

            it('should be false if model has id and rev', function () {
                marvin.set('_rev', 'rev');
                marvin.isNew().should.be.false;
            });
        });

        describe('#validate()', function () {
            var Monster, marvin, schema;

            before(function () {
                schema = {type: 'object'};
                Monster = monster.define('Monster', {
                    schema: schema,
                });
                marvin = new Monster('marvin');
            });

            it('should return undefined if no schema is given', function () {
                expect(marvin.validate()).not.to.exist;
            });

            it('should validate attributes against schema using monster validator',
               function () {
                   sinon.stub(monster.validator, 'validate').returns({
                       errors: ['array of errors'],
                   });

                   marvin.validate();
                   monster.validator.validate.should.have.been.calledWith(
                       marvin.attributes, schema);
                   monster.validator.validate.restore();
               });

            it('should return the validation report\'s errors', function () {
                var errors = ['array of errors'];
                sinon.stub(monster.validator, 'validate').returns({
                    errors: errors,
                });

                marvin.validate().should.equal(errors);
                monster.validator.validate.restore();
            });

            it('should return undefined if there are no validation errors',
               function () {
                   sinon.stub(monster.validator, 'validate').returns({
                       errors: [],
                   });

                   expect(marvin.validate()).not.to.exist;
                   monster.validator.validate.restore();
               });
        });

        describe('#isValid()', function () {
            it('should be true if there are no errors', function () {
                sinon.stub(marvin, 'validate').returns(undefined);
                marvin.isValid().should.be.true;
                marvin.validate.restore();
            });

            it('should be false if there are errors', function () {
                sinon.stub(marvin, 'validate').returns(['errors']);
                marvin.isValid().should.be.false;
                marvin.validate.restore();
            });
        });

        describe('persistence', function () {
            var mock;

            beforeEach(function () {
                monster.db = {
                    get: function(){},
                    insert: function(){},
                    destroy: function(){},
                    head: function(){},
                };
                mock = sinon.mock(monster.db);
            });

            afterEach(function () {
                mock.verify();
                mock.restore();
            });

            describe('#exists()', function () {
                it('should yield revision if object exists', function (done) {
                    var headers = {etag: '"rev"'};
                    mock.expects('head').withArgs('marvin')
                        .yields(null, null, headers);
                    marvin.exists(function (err, revision) {
                        revision.should.equal('rev');
                        done(err);
                    });
                });

                it("should be falsy if object doesn't exist", function (done) {
                    var error = new Error();
                    error.status_code = 404;
                    mock.expects('head').withArgs('marvin').yields(error);
                    marvin.exists(function (err, revision) {
                        expect(revision).not.to.be.ok;
                        done(err);
                    });
                });
            });

            describe('#fetch()', function () {
                it('should retrieve object from database', function (done) {
                    var model = new Monster('marvin');
                    mock.expects('get').withArgs('marvin')
                        .yields(null, marvin.attributes);
                    model.fetch(function (err) {
                        model.attributes.should.deep.equal(marvin.attributes);
                        done(err);
                    });
                });
            });

            describe('#save()', function () {
                var res = {
                    ok: true,
                    _id: 'marvin',
                    _rev: 'rev',
                };

                it('should save attributes with _type', function (done) {
                    var expected = marvin.toJSON();
                    expected._id = 'marvin';
                    expected._type = 'Monster';

                    var model = marvin.clone();
                    mock.expects('insert').once()
                        .withArgs(expected, 'marvin')
                        .yields(null, res);
                    model.save(done);
                });

                it('should set revision of model', function (done) {
                    var model = marvin.clone();
                    mock.expects('insert').yields(null, res);
                    model.save(function (err) {
                        model.get('_rev').should.equal('rev');
                        done(err);
                    });
                });

                it('should create without id', function (done) {
                    var model = marvin.clone();
                    model.unset('_id');

                    var expected = model.toJSON();
                    expected._type = 'Monster';

                    mock.expects('insert').once()
                        .withArgs(expected, undefined)
                        .yields(null, res);
                    model.save(function (err) {
                        model.get('_id').should.equal('marvin');
                        done(err);
                    });
                });

                it('should update with id and rev', function (done) {
                    var model = marvin.clone();
                    model.set('_rev', 'rev');

                    var res = {
                        ok: true,
                        _id: 'marvin',
                        _rev: 'rev2',
                    };
                    mock.expects('insert').yields(null, res);
                    model.save(function (err) {
                        model.rev().should.equal('rev2');
                        done(err);
                    });
                });

                it('should yield ValidationError if model is invalid', function (done) {
                    var model = marvin.clone();
                    sinon.stub(model, 'validate').returns(['Oh no']);
                    mock.expects('insert').never();
                    model.save(function (err) {
                        err.name.should.equal('ValidationError');
                        err.errors.should.deep.equal(['Oh no']);
                        done();
                    });
                });

                it('should yield UniquenessError if id is taken', function(done) {
                    var model = marvin.clone();
                    mock.expects('insert').yields(errs.create({
                        status_code: 409,
                    }));
                    model.save(function (err) {
                        err.name.should.equal('UniquenessError');
                        err.message.should.equal('ID "marvin" already exists');
                        done();
                    });
                });
            });

            describe('#destroy()', function () {
                it('should delete with id and rev', function (done) {
                    var model = new Monster('marvin', {_rev: 'rev'});
                    var res = {
                        ok: true,
                        _id: 'marvin',
                        _rev: 'rev2',
                    };
                    mock.expects('destroy').once()
                        .withArgs('marvin', 'rev')
                        .yields(null, res);
                    model.destroy(function (err) {
                        model.id().should.equal('marvin');
                        model.rev().should.equal('rev2');
                        done(err);
                    });
                });
            });
        });
    });
});
