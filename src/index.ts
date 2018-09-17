import chalk from "chalk";

type TObject = { [key: string]: any };

class TableCLI {

    config: TObject = {};
    options: TObject = {
        terminalWidth: process.stdout.columns,
        terminalHeight: process.stdout.rows,
        responsive: true,
        flipTable: false,
        terminalRatio: process.stdout.columns / process.stdout.rows,
        customRatio: 1.5
    };
    userConfig: TObject = {};
    averageCellWidth: any = {};
    header: string[] = [];
    headerAlias: string[] = [];
    dataMatrix: [number, string[]][] = [];
    data: [number, string[]][] = [];
    flipTable: boolean = false;

    maxColumnWidth: TObject = {};
    maxRows: number = 0;
    maxWidth: number = 0;
    showHeader: boolean = true;
    globalOptions: any = {
        align: 'right',
        valign: 'top',
        width: 'auto',
        trimFrom: 'auto',
        paddingLeft: 2,
        paddingRight: 2,
        wordWrap: true,
        terminalWidth: process.stdout.columns,
        tableStyle: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
            , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
            , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
            , 'right': '║', 'right-mid': '╢', 'middle': '│'
        }
    };
    columnStatus: number[][] = [];

    constructor(config: TObject) {

        this.userConfig = config || {};

        if (typeof this.userConfig['globalOptions'] !== 'undefined') {

            if (typeof this.userConfig['globalOptions']['terminalWidth'] !== 'undefined' && +this.userConfig['globalOptions']['terminalWidth'] > 0) {
                this.options.terminalWidth = this.userConfig['globalOptions']['terminalWidth'];
            }
            if (typeof this.userConfig['globalOptions']['terminalHeight'] !== 'undefined' && +this.userConfig['globalOptions']['terminalHeight'] > 0) {
                this.options.terminalWidth = this.userConfig['globalOptions']['terminalHeight'];
            }
        }

        this.options.terminalRatio = this.options.terminalWidth / this.options.terminalHeight;

        this.config = {
            header: {},
            showHeader: true,
            globalOptions: this.globalOptions
        };


        this.config = {...{}, ...this.config, ...this.userConfig};
        this.options = {...{}, ...this.options, ...this.config};

        for (let i in this.globalOptions) {

            if (!this.options.globalOptions.hasOwnProperty(i)) {
                this.options.globalOptions[i] = this.globalOptions[i];
            }

        }

    }

    /**
     * Get value or replace it
     * @param {number | string} colNameIdx
     * @param {number} rowIdx
     * @param {(text: string) => string} replacer
     * @returns {string}
     */
    getColRow(colNameIdx: number | string, rowIdx: number = -1, replacer?: (cellValue: string, rowInfo: { [key: string]: any }, cellIndex: number) => string): string | string[] {

        let {forceString} = require('./helpers/utils');
        let colIdx: number = -1;
        let text: string = '';

        const {removeAnsi, hasAnsi, getAnsi} = require('./helpers/ansi');

        if (typeof colNameIdx === "string" && isNaN(parseInt(colNameIdx.toString()))) {

            let searchCol = this.header.map(i => i.toLowerCase()).indexOf(colNameIdx.toLowerCase());

            if (searchCol === -1) {

                searchCol = this.headerAlias.map(i => i.toLowerCase()).indexOf(colNameIdx.toLowerCase());

                if (searchCol !== -1) {

                    colIdx = searchCol;

                }

            } else {

                colIdx = searchCol;

            }

        } else {

            colIdx = +colNameIdx;

        }

        if (colIdx > -1) {

            let {forceString} = require('./helpers/utils');

            if (this.flipTable) {

                if (rowIdx === -1) {

                    let stackText: string[] = [];

                    if (
                        typeof this.dataMatrix[colIdx] !== 'undefined' &&
                        typeof this.dataMatrix[colIdx][1] !== 'undefined'
                    ) this.dataMatrix[colIdx][1].forEach((row, rowIdx: number) => {

                        let openAnsi: string = '';
                        let closeAnsi: string = '';

                        text = this.dataMatrix[colIdx][1][rowIdx].toString();
                        // text = forceString(this.dataMatrix[colIdx][1][rowIdx]);

                        if (hasAnsi(text)) {

                            let ansi = getAnsi(text);

                            for (let i = 0; i < ansi.length / 2; i++) {
                                openAnsi += ansi[i];
                            }

                            for (let i = ansi.length / 2; i < ansi.length; i++) {
                                closeAnsi += ansi[i];
                            }

                        }

                        if (typeof replacer === 'function') {

                            let passObj: any = {};

                            this.dataMatrix.map(item => item[1][rowIdx]).forEach((i, idx) => {
                                passObj[this.header[idx]] = removeAnsi(i);
                            });

                            let cb: any = replacer(removeAnsi(text), passObj, rowIdx);

                            let isArray: boolean = true;

                            if (typeof cb !== 'object' || typeof cb.length === 'undefined') {
                                cb = forceString(cb);
                                isArray = false;
                            }

                            this.dataMatrix[colIdx][1][rowIdx] = isArray ? cb.map((i: string) => openAnsi + i + closeAnsi) : openAnsi + cb + closeAnsi;

                            // this.dataMatrix[colIdx][1][rowIdx] = openAnsi + cb + closeAnsi;

                        }

                        stackText.push(this.dataMatrix[colIdx][1][rowIdx]);

                    });

                    return stackText;

                } else {

                    if (
                        typeof this.dataMatrix[colIdx] !== 'undefined' &&
                        typeof this.dataMatrix[colIdx][1] !== 'undefined' &&
                        typeof this.dataMatrix[colIdx][1][rowIdx] !== 'undefined'
                    ) {

                        text = this.dataMatrix[colIdx][1][rowIdx].toString();
                        // text = forceString(this.dataMatrix[colIdx][1][rowIdx]);

                        if (typeof replacer === 'function') {

                            let passObj: any = {};

                            this.dataMatrix.map(item => item[1][rowIdx]).forEach((i, idx) => {
                                passObj[this.header[idx]] = removeAnsi(i);
                            });

                            let openAnsi: string = '';
                            let closeAnsi: string = '';

                            if (hasAnsi(text)) {

                                let ansi = getAnsi(text);

                                for (let i = 0; i < ansi.length / 2; i++) {
                                    openAnsi += ansi[i];
                                }

                                for (let i = ansi.length / 2; i < ansi.length; i++) {
                                    closeAnsi += ansi[i];
                                }

                            }

                            let cb: any = replacer(removeAnsi(text), passObj, rowIdx);

                            let isArray: boolean = true;
                            if (typeof cb !== 'object' || typeof cb.length === 'undefined') {
                                cb = forceString(cb);
                                isArray = false;
                            }

                            this.dataMatrix[colIdx][1][rowIdx] = isArray ? cb.map((i: string) => openAnsi + i + closeAnsi) : openAnsi + cb + closeAnsi;

                            return this.dataMatrix[colIdx][1][rowIdx];

                        }

                    }

                }

            } else {

                if (rowIdx === -1) {

                    let stackText: string[] = [];

                    this.dataMatrix.forEach((row, rowIdx: number) => {

                        if (
                            typeof this.dataMatrix[rowIdx] !== 'undefined' &&
                            typeof this.dataMatrix[rowIdx][1] !== 'undefined' &&
                            typeof this.dataMatrix[rowIdx][1][colIdx] !== 'undefined'
                        ) {

                            if (typeof replacer === 'function') {

                                let passObj: any = {};

                                this.dataMatrix[rowIdx][1].forEach((i, idx) => {
                                    passObj[this.header[idx]] = removeAnsi(i);
                                });

                                let openAnsi: string = '';
                                let closeAnsi: string = '';

                                text = this.dataMatrix[rowIdx][1][colIdx].toString();

                                if (hasAnsi(text)) {

                                    let ansi = getAnsi(text);

                                    for (let i = 0; i < ansi.length / 2; i++) {
                                        openAnsi += ansi[i];
                                    }

                                    for (let i = ansi.length / 2; i < ansi.length; i++) {
                                        closeAnsi += ansi[i];
                                    }

                                }

                                let cb: any = replacer(removeAnsi(text), passObj, rowIdx);

                                let isArray: boolean = true;
                                if (typeof cb !== 'object' || typeof cb.length === 'undefined') {
                                    cb = forceString(cb);
                                    isArray = false;
                                }


                                //this.dataMatrix[rowIdx][1][colIdx] = openAnsi + cb + closeAnsi;
                                this.dataMatrix[rowIdx][1][colIdx] = isArray ? cb.map((i: string) => openAnsi + i + closeAnsi) : openAnsi + cb + closeAnsi;

                                stackText.push(this.dataMatrix[rowIdx][1][colIdx]);

                            } else {

                                stackText.push(this.dataMatrix[rowIdx][1][colIdx].toString());

                            }

                        }


                    });

                    return stackText;

                } else {

                    if (
                        typeof this.dataMatrix[rowIdx] !== 'undefined' &&
                        typeof this.dataMatrix[rowIdx][1] !== 'undefined' &&
                        typeof this.dataMatrix[rowIdx][1][colIdx] !== 'undefined'
                    ) {

                        let openAnsi: string = '';
                        let closeAnsi: string = '';

                        text = this.dataMatrix[rowIdx][1][colIdx].toString();

                        if (hasAnsi(text)) {

                            let ansi = getAnsi(text);

                            for (let i = 0; i < ansi.length / 2; i++) {
                                openAnsi += ansi[i];
                            }

                            for (let i = ansi.length / 2; i < ansi.length; i++) {
                                closeAnsi += ansi[i];
                            }

                        }

                        if (typeof replacer === 'function') {

                            let passObj: any = {};

                            this.dataMatrix[rowIdx][1].forEach((i, idx) => {
                                passObj[this.header[idx]] = removeAnsi(i);
                            });

                            let cb: any = replacer(removeAnsi(text), passObj, rowIdx);

                            let isArray: boolean = true;
                            if (typeof cb !== 'object' || typeof cb.length === 'undefined') {
                                cb = forceString(cb);
                                isArray = false;
                            }

                            this.dataMatrix[rowIdx][1][colIdx] = isArray ? cb.map((i: string) => openAnsi + i + closeAnsi) : openAnsi + cb + closeAnsi;

                            return this.dataMatrix[rowIdx][1][colIdx];

                        }

                    }

                }

            }

        }

        return forceString(text);

    }

    setData(data: TObject = {}, flipTable: boolean = false) {

        this.flipTable = flipTable;
        this.options.flipTable = flipTable;

        const {correctData, tableMatrix, tableHeader} = require('./helpers/rows');
        let {loop, keys} = require('./helpers/utils');

        data = correctData(data);

        this.dataMatrix = tableMatrix(data, flipTable);

        this.maxRows = this.dataMatrix.length;

        this.header = tableHeader(data);

        data = null;

        this.headerAlias = [...this.header];

        loop(this.config.header, (col: any, prop: string, val: string) => {

            let colPosition: number = this.header.indexOf(col);

            if (colPosition !== -1 && prop.toLowerCase() === 'alias' && this.headerAlias[colPosition] !== val) {

                this.headerAlias[colPosition] = val;

            }

        });

        if (typeof this.config.showHeader === 'boolean') {
            this.showHeader = this.config.showHeader;
        }

        /**
         * AutoComplete columns properties
         */
        this.header.forEach((item, index: number) => {

            if (typeof this.config.header[item] === "undefined") {
                this.config.header[item] = {};
            }

            if (typeof this.config.header[item]['align'] === "undefined") {
                this.config.header[item]['align'] = this.config.globalOptions.align;
            }

            if (['left', 'center', 'right'].indexOf(this.config.header[item]['align'].toLowerCase()) === -1) {
                this.config.header[item]['align'] = this.globalOptions.align;
            }

            if (typeof this.config.header[item]['valign'] === "undefined") {
                this.config.header[item]['valign'] = this.config.globalOptions.valign;
            }
            if (['top', 'middle', 'bottom'].indexOf(this.config.header[item]['valign'].toLowerCase()) === -1) {
                this.config.header[item]['valign'] = this.globalOptions.valign;
            }
            if (typeof this.config.header[item]['alias'] === "undefined") {
                this.config.header[item]['alias'] = item;
            }
            if (typeof this.config.header[item]['wordWrap'] === "undefined") {
                this.config.header[item]['wordWrap'] = this.config.globalOptions.wordWrap;
            }
            if (typeof this.config.header[item]['width'] === "undefined") {
                this.config.header[item]['width'] = this.config.globalOptions.width;
            }
            if (typeof this.config.header[item]['trimFrom'] === "undefined") {
                this.config.header[item]['trimFrom'] = this.config.globalOptions.trimFrom;
            }
            if (typeof this.config.header[item]['show'] === "undefined") {
                this.config.header[item]['show'] = true;
            }
            if (typeof this.config.header[item]['paddingLeft'] === "undefined" || typeof +this.config.header[item]['paddingLeft'] !== "number") {
                this.config.header[item]['paddingLeft'] = this.config.globalOptions.paddingLeft;
            }
            if (typeof this.config.header[item]['paddingRight'] === "undefined" || typeof +this.config.header[item]['paddingRight'] !== "number") {
                this.config.header[item]['paddingRight'] = this.config.globalOptions.paddingRight;
            }

            if (typeof this.config.header[item]['priority'] === "undefined" || typeof +this.config.header[item]['priority'] !== "number") {

                /**
                 * Auto-increment priority for columns
                 * The columns with the highest priority will be removed
                 * @type {number}
                 */
                this.config.header[item]['priority'] = ((): number => {

                    let tch: any = this.config.header;

                    let nextPrio: number[] = this.header
                        .map(i => +(typeof tch[i] === 'undefined' || typeof tch[i]['priority'] === 'undefined' ? -1 : tch[i]['priority']))
                        .filter(i => +i > 0)
                        .sort((a: number, b: number) => a - b);

                    if (nextPrio.indexOf(1) === -1) return 1;

                    nextPrio = nextPrio.filter((i, idx) => (i - nextPrio[idx - 1]) === 1 || i === 1);

                    return nextPrio[nextPrio.length - 1] + 1;

                })();

            }

        });

        return this;

    }

    space(text: string, columnStatus: any = [], textAlign: "left" | "center" | "right" = "right", delimiter: string = ' '): string {

        let {hasAnsi, getAnsi, removeAnsi} = require('./helpers/ansi');

        let newText: string = text;
        let spaceDelimiter: string = delimiter;
        let openAnsi: string = '';
        let closeAnsi: string = '';

        if (hasAnsi(text)) {

            let ansi = getAnsi(text);

            for (let i = 0; i < ansi.length / 2; i++) {
                openAnsi += ansi[i];
            }

            for (let i = ansi.length / 2; i < ansi.length; i++) {
                closeAnsi += ansi[i];
            }

        }

        let cleanText = removeAnsi(text).trim();

        let paddingLeft: string = new Array(+columnStatus[2] + 1).join(spaceDelimiter);
        let paddingRight: string = new Array(+columnStatus[3] + 1).join(spaceDelimiter);

        let maxCellWidth: number = removeAnsi(text).length - paddingLeft.length - paddingRight.length; // +columnStatus[1];

        if (maxCellWidth > 0) {

            let spacesLeft: string = '';
            let spacesRight: string = '';

            if (textAlign === 'left') {

                spacesRight = new Array(maxCellWidth - cleanText.length + 1).join(spaceDelimiter);

            }

            if (textAlign === 'center') {

                spacesLeft = new Array(Math.floor((maxCellWidth - cleanText.length) / 2) + 1).join(spaceDelimiter);
                spacesRight = new Array(Math.ceil((maxCellWidth - cleanText.length) / 2) + 1).join(spaceDelimiter);

            }

            if (textAlign === 'right') {

                spacesLeft = new Array(maxCellWidth - cleanText.length + 1).join(spaceDelimiter);

            }

            newText = spacesLeft + openAnsi + cleanText + closeAnsi + spacesRight;

        }

        return paddingLeft + newText + paddingRight;

    }

    output(getOutput: boolean = false, rawData: boolean = false) {

        let {removeAnsi} = require('./helpers/ansi');
        let {prepareData} = require('./helpers/rows');
        let {keys} = require('./helpers/utils');

        /**
         * Add HEADER COLUMN
         */

        if (this.showHeader) {

            let formattedAlias: string[] = this.headerAlias;//.map(i => chalk.bgCyan.whiteBright.bold(i));

            if (this.flipTable) {

                for (let [rowIndex] of this.dataMatrix) {

                    this.dataMatrix[rowIndex][1].splice(0, 0, formattedAlias[rowIndex]);

                }

            } else {

                this.dataMatrix.splice(0, 0, [-1, formattedAlias]);

                this.dataMatrix = this.dataMatrix.map(item => {
                    item[0] = item[0] + 1;
                    return item;
                });

            }

        }

        this.config['tableColumns'] = {
            header: this.header,
            headerAlias: this.headerAlias
        };

        this.config['averageCellWidth'] = this.averageCellWidth;
        this.config['maxColumnWidth'] = this.maxColumnWidth;
        this.config = {...{}, ...this.config, ...this.userConfig};
        this.options = {...{}, ...this.options, ...this.config};

        let newData: any = prepareData(this.dataMatrix, this.options);

        this.columnStatus = newData[1];
        this.options = newData[2];

        newData = newData[0];

        let onlyRows: [number, string[]][] = [];

        let rawDataOutput: any = newData;

        newData = newData
            .map((row: [number, string[]], rowIdx: number) => {

                /**
                 * Vertical Alignment
                 */
                let alignVertical: "top" | "middle" | "bottom" = "middle";

                let maxRowsInRow: number = +row[1].map(i => i.length).sort((a, b): any => a > b)[0];

                row[1] = row[1].map((i: any, idx: number) => {

                    let maxIlen: number = removeAnsi(i[0]).length;

                    if (!this.flipTable) {

                        alignVertical = this.options.header[this.options.tableColumns.header[idx]].valign;

                        if (this.showHeader && rowIdx === 0) {
                            alignVertical = 'middle';
                        }

                    } else {

                        alignVertical = this.options.header[this.options.tableColumns.header[rowIdx]].valign;

                    }

                    i = i.filter((ii: any) => removeAnsi(ii.trim()).length);

                    if (alignVertical === 'middle') {

                        let topCells: number = Math.floor((maxRowsInRow - i.length) / 2);
                        let bottomCells: number = Math.ceil((maxRowsInRow - i.length) / 2);

                        for (let j = 0; j < topCells; j++) {
                            i.splice(0, 0, new Array(maxIlen + 1).join(' '))
                        }
                        for (let j = 0; j < bottomCells; j++) {
                            i.push(new Array(maxIlen + 1).join(' '))
                        }

                    }

                    if (['top', 'bottom'].indexOf(alignVertical.toLowerCase()) !== -1) {

                        for (let j = maxRowsInRow - i.length; j > 0; j--) {
                            if (alignVertical === 'top') {
                                i.push(new Array(maxIlen + 1).join(' '))
                            } else {
                                i.splice(0, 0, new Array(maxIlen + 1).join(' '))
                            }
                        }

                    }

                    return i;

                });

                return row;

            })
            .map((row: [number, string[]], rowIdx: number) => {

                /**
                 * Horizontal Alignment
                 */
                let alignHorizontal: 'right' | 'center' | 'left' = "right";

                row[1] = row[1].map(((i: any, idx) => {

                    let cs: any = this.columnStatus.filter(i => i[0] === idx)[0];

                    if (!this.flipTable) {

                        alignHorizontal = this.options.header[this.options.tableColumns.header[cs[0]]].align;

                    } else {

                        alignHorizontal = this.options.header[this.options.tableColumns.header[rowIdx]].align;

                        /**
                         * Force Header column to be centered
                         */
                        if (this.showHeader) {

                            if (idx === 0) {

                                alignHorizontal = 'center';

                            } else {

                                alignHorizontal = this.options.header[this.options.tableColumns.header[rowIdx]].align;

                            }

                        }

                    }

                    i = i.map((ii: any) => this.space(ii, cs, alignHorizontal));

                    /**
                     * Add +1 paddingTop && +1 paddingBottom to header and to flipped content
                     */
                    if (this.showHeader) {

                        if (this.flipTable) {

                            let itemLen: number = removeAnsi(i[0]).length;

                            i.splice(0, 0, new Array(itemLen + 1).join(' '));
                            i.push(new Array(itemLen + 1).join(' '));

                            if (idx === 0) {

                                i = i.map((ii: any) => chalk.white.bgCyan(ii));

                            }

                        } else {

                            if (rowIdx === 0) {

                                i.splice(0, 0, new Array(removeAnsi(i[rowIdx]).length + 1).join(' '));
                                i.push(new Array(removeAnsi(i[rowIdx]).length + 1).join(' '));

                                i = i.map((ii: any) => chalk.white.bgCyan(ii));

                            }

                        }

                    }

                    return i;

                }));

                return row;

            });


        let lastRowID: number = -1;


        newData.forEach((row: any, idx: number) => {

            let [rowId, rows] = row;

            for (let i = 0; i < rows[0].length; i++) {

                let hold: any = [];

                rows.forEach((item: any, idx: number) => {

                    if (idx === 0) {
                        hold.push('|');
                    }

                    hold.push(item[i]);
                    hold.push('|');

                });

                if (i === 0 && lastRowID !== rowId) {

                    lastRowID = rowId;

                    onlyRows.push([rowId, hold.map((i: string, idx: number) => {

                        if (idx % 2 == 0) {

                            return rowId === 0 ? '-' : '|';

                        }

                        return new Array(removeAnsi(i).length + 1).join('–');

                    })]);

                }

                onlyRows.push([rowId, hold]);

            }

            if (idx === newData.length - 1) {

                onlyRows.push([rowId, onlyRows[0][1]]);

            }

        });

        if (getOutput) {

            if (rawData) {

                return rawDataOutput;

            } else {

                return onlyRows;

            }

        } else {

            onlyRows.forEach((item: any, index: number) => {

                this.console(item[1].join(''));

            });

        }

    }

    /**
     * Format columns or specific cells
     * @param {string | number} columnNameOrIndex
     * @param {(cellIndex: number, cellValue: string) => string} replacer
     * @returns {this}
     */
    formatColumn(columnNameOrIndex: string | number, replacer: (cellValue?: string, rowInfo?: { [key: string]: any }, cellIndex?: number) => string): this;
    formatColumn(columnNameOrIndex: string | number, rowIndex: number, replacer: (cellValue?: string, rowInfo?: { [key: string]: any }, cellIndex?: number) => string): this;
    formatColumn(columnNameOrIndex: string | number, rowOrFn: number | ((cellValue?: string, rowInfo?: { [key: string]: any }, cellIndex?: number) => string), replacer?: (cellValue?: string, rowInfo?: { [key: string]: any }, cellIndex?: number) => string): this {

        if (typeof rowOrFn === 'function') {

            replacer = rowOrFn;
            rowOrFn = -1;

        } else {

            rowOrFn = +rowOrFn;

            if (rowOrFn < 0 || typeof +rowOrFn !== 'number') {

                rowOrFn = -1;

            }

        }

        this.getColRow(columnNameOrIndex, rowOrFn, replacer);

        return this;

    }

    /**
     * Default output
     * @param {string} input
     */
    private console(...input: string[]) {

        let chalk = require("chalk");

        console.log.apply(console, input.map(item => chalk.cyanBright.bold(item)));

    }

}

module.exports = (params: any) => {

    return new TableCLI(params);

};