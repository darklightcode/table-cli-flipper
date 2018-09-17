let assert = require('assert');

let utils = require('../lib/helpers/utils');

describe('Utils', function () {
    describe('isJSON', function () {
        it('should return ok', function () {

            assert.equal(utils.isJSON('["1"]'), true);
        });
        it('should return false', function () {
            assert.equal(utils.isJSON("invalid json"), false);
        });
    });

    describe('keys', function () {
        it('should return ["first", "second"]', function () {

            let c = {
                'first': 1,
                'second': '2'
            };

            assert.deepEqual(utils.keys(c), ['first', 'second']);
        });

    });
    describe('forceString', function () {

        let itIsNull = "it is null";
        let itIsUndefined = "it is undefined";

        it(`should return "${itIsNull}"`, function () {

            assert.equal(utils.forceString(null, itIsNull), itIsNull);

        });

        it(`should return "${itIsUndefined}"`, function () {

            assert.equal(utils.forceString(undefined, itIsUndefined), itIsUndefined);

        });

    });
});

