MOCHA_OPTS=--reporter nyan
UNIT_TEST_FILES=$(shell find test/unit/ -name '*.js')
INTEGRATION_TEST_FILES=$(shell find test/integration/ -name '*.js')


install:
	@npm install

test: test-unit test-integration

test-unit:
	@NODE_ENV=test NODE_PATH=./lib ./node_modules/.bin/mocha \
		$(MOCHA_OPTS) --require test/unit/common $(UNIT_TEST_FILES)

test-integration:
	@NODE_ENV=test NODE_PATH=./lib ./node_modules/.bin/mocha \
		$(MOCHA_OPTS) --require test/integration/common $(INTEGRATION_TEST_FILES)

.PHONY: install test test-unit test-integration
