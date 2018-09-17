var createOptions = function () {
};
/**
 * Loop and object
 * @param data
 * @param {(key1: string, key2: string, value: string) => any} callback
 */
var loop = function (data, callback) {
    if (data === void 0) { data = {}; }
    if (callback === void 0) { callback = function () {
    }; }
    if (typeof data === 'object' && keys(data).length) {
        for (var record in data) {
            if (data.hasOwnProperty(record)) {
                for (var columnName in data[record]) {
                    if (data[record].hasOwnProperty(columnName)) {
                        callback(record.toString(), columnName.toString(), forceString(data[record][columnName]));
                    }
                }
            }
        }
    }
};
/**
 * A wrapper for Object.keys
 * @param object
 * @returns {string[]}
 */
var keys = function (object) {
    if (object === void 0) { object = {}; }
    return Object.keys(object);
};
/**
 * Force any value to string
 * @param txt
 * @param {string} fallbackValue
 * @returns {string}
 */
var forceString = function (txt, fallbackValue) {
    if (fallbackValue === void 0) { fallbackValue = ''; }
    if ([undefined, null].indexOf(typeof txt) !== -1 || txt === null || txt === undefined) {
        return fallbackValue;
    }
    else {
        return txt.toString();
    }
};
/**
 * Check if a string is JSON
 * @param {string} str
 * @returns {boolean}
 */
var isJSON = function (str) {
    if (str === void 0) { str = ""; }
    try {
        var j = JSON.parse(str);
        return typeof j === 'object' && j !== null;
    }
    catch (e) {
        return false;
    }
};
exports.forceString = forceString;
exports.keys = keys;
exports.loop = loop;
exports.isJSON = isJSON;
