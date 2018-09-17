declare const createOptions: any;
/**
 * Loop and object
 * @param data
 * @param {(key1: string, key2: string, value: string) => any} callback
 */
declare const loop: (data?: any, callback?: (key1: string, key2: string, value: string) => any) => void;
/**
 * A wrapper for Object.keys
 * @param object
 * @returns {string[]}
 */
declare const keys: (object?: any) => string[];
/**
 * Force any value to string
 * @param txt
 * @param {string} fallbackValue
 * @returns {string}
 */
declare const forceString: (txt: any, fallbackValue?: string) => string;
/**
 * Check if a string is JSON
 * @param {string} str
 * @returns {boolean}
 */
declare const isJSON: (str?: string) => boolean;
