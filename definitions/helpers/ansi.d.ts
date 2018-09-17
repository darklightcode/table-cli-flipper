/**
 * Check if text contains ANSI codes
 * @param {string} txt
 * @returns {boolean}
 */
declare const hasAnsi: (txt?: string) => boolean;
/**
 * Get ANSI codes from text
 * @param {string} txt
 * @returns {string[]}
 */
declare const getAnsi: (txt: string) => string[];
/**
 * Remove ANSI Text from string
 * @param {string} txt
 * @returns {string}
 */
declare const removeAnsi: (txt?: string) => string;
