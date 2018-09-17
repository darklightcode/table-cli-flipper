/**
 * Check if text contains ANSI codes
 * @param {string} txt
 * @returns {boolean}
 */
const hasAnsi = (txt: string = ''): boolean => {

    if (!txt.length) {

        return false;

    } else {

        let pattern: string = [
            '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
            '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
        ].join('|');

        let x = new RegExp(pattern, 'g');

        return x.test(txt);

    }

};

/**
 * Get ANSI codes from text
 * @param {string} txt
 * @returns {string[]}
 */
const getAnsi = (txt: string): string[] => {

    if (['undefined', null].indexOf(typeof txt) !== -1) {
        txt = '';
    }

    const pattern = [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
    ].join('|');

    let x = new RegExp(pattern, 'g');

    return txt.match(x)

};

/**
 * Remove ANSI Text from string
 * @param {string} txt
 * @returns {string}
 */
const removeAnsi = (txt: string = ''): string => {

    if (['undefined', null].indexOf(typeof txt) !== -1) {
        txt = '';
    }

    const x = '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))';
    return txt.toString().replace(new RegExp(x, 'g'), '');

};

exports.hasAnsi = hasAnsi;
exports.getAnsi = getAnsi;
exports.removeAnsi = removeAnsi;

