# Table CLI Flipper
![Table CLI Flipper](https://raw.githubusercontent.com/darklightcode/table-cli-flipper/master/psd/icon.png =250x250)
A simple cyan colored table for your data that allows you to format columns and flip your data.

```
npm install table-cli-flipper --save
```

# Update

1.0.1 :
----------------
- You can show/hide header/columns
- Format columns/rows as you consider. (Breaking lines can be done by using '\n', '\r', '\r\n' in your texts, or by returning an array of strings [ string1, string2, ... , stringN])
- WrapWrap texts
- Flip table to the left
- Read the example below for usage and additional information. 'exampleConfig' contains global and user options.


### Example - Table Normal
![Table Normal](https://raw.githubusercontent.com/darklightcode/table-cli-flipper/master/psd/table-normal.png)

### Example - Table Flipped
![Table Flipped](https://raw.githubusercontent.com/darklightcode/table-cli-flipper/master/psd/table-flipped.png)

### Usage Example

```javascript

process.stdout.write('\033c');
console.log('\033c');

let table = require('table-cli-flipper');

let data = {};

let recordsNr = 5;

for (let i = 0; i < recordsNr; i++) {

    if (typeof data[i] === 'undefined') {

        data[i] = {
            rowNr: 'this will change', // We'll format this column to get a numeric incremented values
            id: i, // Color the 3rd row
            name: 'Project #' + i,
            status: Math.round(Math.random()), // 1 or 0 -> We'll format this to show "Online" or "Offline"
        }
    }

}

/**
 * Default Config
 * @type {{showHeader: boolean, globalOptions: {align: string, valign: string, width: string, paddingLeft: number, paddingRight: number, wordWrap: boolean, terminalWidth: number}, header: {id: {alias: string, align: string, valign: string, priority: number, width: string, paddingLeft: number, paddingRight: number, wordWrap: boolean, show: boolean}, rowNr: {alias: string}}}}
 */
let exampleConfig = {
    showHeader: true,
    globalOptions: {
        align: 'right',
        valign: 'top',
        width: 'auto',
        paddingLeft: 2,
        paddingRight: 2,
        wordWrap: true,
        terminalWidth: process.stdout.columns, // terminal Width by default, you can change this with a constant
    },
    header: {
        id: {
            alias: 'ids', // Change column name
            align: 'right', // Horizontal align -> left | center | right
            valign: 'middle', // Vertical align -> top | middle | bottom
            priority: 1000, // This is used for trimming columns, it's auto-incremented for columns that don't have it. The columns with the highest priority will be removed if the table is larger than the terminalWidth
            width: 'auto', // Can accept a percentage, a constant or 'auto' ( 'auto' columns will get a higher priority than the % or constant columns, therefore will be targeted for removing as being noted in the 'priority' option )
            paddingLeft: 1, // paddingLeft -  ( Width - paddingLeft - paddingRight ) cannot be less than 0
            paddingRight: 1, // paddingRight -  ( Width - paddingRight - paddingRight  ) cannot be less than 0
            wordWrap: true, // Word wrap the cell text
            show: true, // True: show column , False : hide column
        },
        rowNr: {
            alias: 'Row Number'
        },

    }
};

const chalk = require('chalk');

let flipTable = process.env.FLIP_TABLE === "true";

process.title = 'TABLE ' + (flipTable ? "FLIPPED" : "NORMAL") + ' - Width: ' + process.stdout.columns + ' - Records count: ' + recordsNr;

let simpleTable = table(exampleConfig)

/**
 * Set data gets and object with data
 * Set the second parameter to TRUE to flip the table
 */
    .setData(data, flipTable)
    /**
     * Format Columns
     * Long Version:
     * -------------
     * columnNameOrIndex: string | number, replacer: (cellValue?: string, rowInfo?: { [key: string]: any }, cellIndex?: number) => string
     * columnNameOrIndex: string | number, rowIndex: number, replacer: (cellValue?: string, rowInfo?: { [key: string]: any }, cellIndex?: number) => string
     *
     * Short Version
     * -------------
     * ( columnNameOrIndex, (cellValue, rowInfo, rowIndex) => { return cellValue } )
     * ( columnNameOrIndex, rowIndex, (cellValue, rowInfo, rowIndex) => { return cellValue } )
     */
    .formatColumn('rowNr', (cellValue, rowInfo, rowIndex) => {

        /**
         * Target all rows from column 'rowNr'
         */

        return rowIndex + 1;

    })
    .formatColumn('id', 2, (cellValue, rowInfo, rowIndex) => {

        /**
         * Target only the 3rd row from 'id' column
         */

        return chalk.white.bgGreen(cellValue);

    })
    .formatColumn('status', (cellValue, rowInfo, rowIndex) => {

        /**
         * Format your column based on the other columns values
         *
         * 'rowInfo' data
         *
         * { rowNr: '1', id: '0', name: 'Project #0', status: '0' }
         * { rowNr: '2', id: '1', name: 'Project #1', status: '0' }
         * { rowNr: '3', id: '2', name: 'Project #2', status: '1' }
         * { rowNr: '4', id: '3', name: 'Project #3', status: '0' }
         * { rowNr: '5', id: '4', name: 'Project #4', status: '0' }
         *
         */

        return +rowInfo.id < 2 ? chalk.white.bgGreen('Green ' + rowIndex) : chalk.white.bgRed('Red ' + rowIndex);

    });

/**
 * By default output parameter is set to FALSE, and the table will be flushed to terminal
 */
simpleTable.output(); //

/**
 * Get the table array
 * 1. First parameter TRUE, second FALSE ( by default ) - get the data formatted with delimiters
 * 2. First parameter TRUE, second TRUE - get the raw data
 */
// let output = simpleTable.output(true);
// let output = simpleTable.output(true, true);

```

**Output:**
```
Mock Server started on port 3010
Mock Server started on port 4500
Mock Server started on port 9921
Free ports: [ 2018, 3010, 4500, 9921, 3985, 5890, 15367, 19661, 22715, 36543 ]
Status available: 2018 0.0.0.0 true
Status unavailable: 3010 0.0.0.0 false
Status unavailable: 4500 0.0.0.0 false
Status unavailable: 9921 0.0.0.0 false
Status available: 3985 0.0.0.0 true
Status available: 5890 0.0.0.0 true
Status available: 15367 0.0.0.0 true
Status available: 19661 0.0.0.0 true
Status available: 22715 0.0.0.0 true
Status available: 36543 0.0.0.0 true
```