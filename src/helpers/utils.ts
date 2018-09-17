const createOptions: any = ()=>{

};
/**
 * Loop and object
 * @param data
 * @param {(key1: string, key2: string, value: string) => any} callback
 */
const loop = (data: any = {}, callback: (key1: string, key2: string, value: string) => any = () => {
}): void => {

    if (typeof data === 'object' && keys(data).length) {

        for (let record in data) {

            if (data.hasOwnProperty(record)) {

                for (let columnName in data[record]) {

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
const keys = (object: any = {}): string[] => {

    return Object.keys(object);

};
/**
 * Force any value to string
 * @param txt
 * @param {string} fallbackValue
 * @returns {string}
 */
const forceString = (txt: any , fallbackValue: string = ''): string => {

    if ([undefined, null].indexOf(typeof txt) !== -1 || txt === null || txt === undefined) {

        return fallbackValue;

    } else {

        return txt.toString();

    }

};

/**
 * Check if a string is JSON
 * @param {string} str
 * @returns {boolean}
 */
const isJSON = (str: string = "") => {
    try {

        let j = JSON.parse(str);

        return typeof j === 'object' && j !== null;

    } catch (e) {
        return false;
    }

};


exports.forceString = forceString;
exports.keys = keys;
exports.loop = loop;
exports.isJSON = isJSON;