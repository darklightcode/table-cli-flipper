"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var TableCLI = /** @class */ (function () {
    function TableCLI(config) {
        this.config = {};
        this.options = {
            terminalWidth: process.stdout.columns,
            terminalHeight: process.stdout.rows,
            responsive: true,
            flipTable: false,
            terminalRatio: process.stdout.columns / process.stdout.rows,
            customRatio: 1.5
        };
        this.userConfig = {};
        this.averageCellWidth = {};
        this.header = [];
        this.headerAlias = [];
        this.dataMatrix = [];
        this.data = [];
        this.flipTable = false;
        this.maxColumnWidth = {};
        this.maxRows = 0;
        this.maxWidth = 0;
        this.showHeader = true;
        this.globalOptions = {
            align: 'right',
            valign: 'top',
            width: 'auto',
            trimFrom: 'auto',
            paddingLeft: 2,
            paddingRight: 2,
            wordWrap: true,
            terminalWidth: process.stdout.columns,
            tableStyle: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
                'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
                'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
                'right': '║', 'right-mid': '╢', 'middle': '│'
            }
        };
        this.columnStatus = [];
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
        this.config = __assign({}, this.config, this.userConfig);
        this.options = __assign({}, this.options, this.config);
        for (var i in this.globalOptions) {
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
    TableCLI.prototype.getColRow = function (colNameIdx, rowIdx, replacer) {
        var _this = this;
        if (rowIdx === void 0) { rowIdx = -1; }
        var forceString = require('./helpers/utils').forceString;
        var colIdx = -1;
        var text = '';
        var _a = require('./helpers/ansi'), removeAnsi = _a.removeAnsi, hasAnsi = _a.hasAnsi, getAnsi = _a.getAnsi;
        if (typeof colNameIdx === "string" && isNaN(parseInt(colNameIdx.toString()))) {
            var searchCol = this.header.map(function (i) { return i.toLowerCase(); }).indexOf(colNameIdx.toLowerCase());
            if (searchCol === -1) {
                searchCol = this.headerAlias.map(function (i) { return i.toLowerCase(); }).indexOf(colNameIdx.toLowerCase());
                if (searchCol !== -1) {
                    colIdx = searchCol;
                }
            }
            else {
                colIdx = searchCol;
            }
        }
        else {
            colIdx = +colNameIdx;
        }
        if (colIdx > -1) {
            var forceString_1 = require('./helpers/utils').forceString;
            if (this.flipTable) {
                if (rowIdx === -1) {
                    var stackText_1 = [];
                    if (typeof this.dataMatrix[colIdx] !== 'undefined' &&
                        typeof this.dataMatrix[colIdx][1] !== 'undefined')
                        this.dataMatrix[colIdx][1].forEach(function (row, rowIdx) {
                            var openAnsi = '';
                            var closeAnsi = '';
                            text = _this.dataMatrix[colIdx][1][rowIdx].toString();
                            // text = forceString(this.dataMatrix[colIdx][1][rowIdx]);
                            if (hasAnsi(text)) {
                                var ansi = getAnsi(text);
                                for (var i = 0; i < ansi.length / 2; i++) {
                                    openAnsi += ansi[i];
                                }
                                for (var i = ansi.length / 2; i < ansi.length; i++) {
                                    closeAnsi += ansi[i];
                                }
                            }
                            if (typeof replacer === 'function') {
                                var passObj_1 = {};
                                _this.dataMatrix.map(function (item) { return item[1][rowIdx]; }).forEach(function (i, idx) {
                                    passObj_1[_this.header[idx]] = removeAnsi(i);
                                });
                                var cb = replacer(removeAnsi(text), passObj_1, rowIdx);
                                var isArray = true;
                                if (typeof cb !== 'object' || typeof cb.length === 'undefined') {
                                    cb = forceString_1(cb);
                                    isArray = false;
                                }
                                _this.dataMatrix[colIdx][1][rowIdx] = isArray ? cb.map(function (i) { return openAnsi + i + closeAnsi; }) : openAnsi + cb + closeAnsi;
                                // this.dataMatrix[colIdx][1][rowIdx] = openAnsi + cb + closeAnsi;
                            }
                            stackText_1.push(_this.dataMatrix[colIdx][1][rowIdx]);
                        });
                    return stackText_1;
                }
                else {
                    if (typeof this.dataMatrix[colIdx] !== 'undefined' &&
                        typeof this.dataMatrix[colIdx][1] !== 'undefined' &&
                        typeof this.dataMatrix[colIdx][1][rowIdx] !== 'undefined') {
                        text = this.dataMatrix[colIdx][1][rowIdx].toString();
                        // text = forceString(this.dataMatrix[colIdx][1][rowIdx]);
                        if (typeof replacer === 'function') {
                            var passObj_2 = {};
                            this.dataMatrix.map(function (item) { return item[1][rowIdx]; }).forEach(function (i, idx) {
                                passObj_2[_this.header[idx]] = removeAnsi(i);
                            });
                            var openAnsi_1 = '';
                            var closeAnsi_1 = '';
                            if (hasAnsi(text)) {
                                var ansi = getAnsi(text);
                                for (var i = 0; i < ansi.length / 2; i++) {
                                    openAnsi_1 += ansi[i];
                                }
                                for (var i = ansi.length / 2; i < ansi.length; i++) {
                                    closeAnsi_1 += ansi[i];
                                }
                            }
                            var cb = replacer(removeAnsi(text), passObj_2, rowIdx);
                            var isArray = true;
                            if (typeof cb !== 'object' || typeof cb.length === 'undefined') {
                                cb = forceString_1(cb);
                                isArray = false;
                            }
                            this.dataMatrix[colIdx][1][rowIdx] = isArray ? cb.map(function (i) { return openAnsi_1 + i + closeAnsi_1; }) : openAnsi_1 + cb + closeAnsi_1;
                            return this.dataMatrix[colIdx][1][rowIdx];
                        }
                    }
                }
            }
            else {
                if (rowIdx === -1) {
                    var stackText_2 = [];
                    this.dataMatrix.forEach(function (row, rowIdx) {
                        if (typeof _this.dataMatrix[rowIdx] !== 'undefined' &&
                            typeof _this.dataMatrix[rowIdx][1] !== 'undefined' &&
                            typeof _this.dataMatrix[rowIdx][1][colIdx] !== 'undefined') {
                            if (typeof replacer === 'function') {
                                var passObj_3 = {};
                                _this.dataMatrix[rowIdx][1].forEach(function (i, idx) {
                                    passObj_3[_this.header[idx]] = removeAnsi(i);
                                });
                                var openAnsi_2 = '';
                                var closeAnsi_2 = '';
                                text = _this.dataMatrix[rowIdx][1][colIdx].toString();
                                if (hasAnsi(text)) {
                                    var ansi = getAnsi(text);
                                    for (var i = 0; i < ansi.length / 2; i++) {
                                        openAnsi_2 += ansi[i];
                                    }
                                    for (var i = ansi.length / 2; i < ansi.length; i++) {
                                        closeAnsi_2 += ansi[i];
                                    }
                                }
                                var cb = replacer(removeAnsi(text), passObj_3, rowIdx);
                                var isArray = true;
                                if (typeof cb !== 'object' || typeof cb.length === 'undefined') {
                                    cb = forceString_1(cb);
                                    isArray = false;
                                }
                                //this.dataMatrix[rowIdx][1][colIdx] = openAnsi + cb + closeAnsi;
                                _this.dataMatrix[rowIdx][1][colIdx] = isArray ? cb.map(function (i) { return openAnsi_2 + i + closeAnsi_2; }) : openAnsi_2 + cb + closeAnsi_2;
                                stackText_2.push(_this.dataMatrix[rowIdx][1][colIdx]);
                            }
                            else {
                                stackText_2.push(_this.dataMatrix[rowIdx][1][colIdx].toString());
                            }
                        }
                    });
                    return stackText_2;
                }
                else {
                    if (typeof this.dataMatrix[rowIdx] !== 'undefined' &&
                        typeof this.dataMatrix[rowIdx][1] !== 'undefined' &&
                        typeof this.dataMatrix[rowIdx][1][colIdx] !== 'undefined') {
                        var openAnsi_3 = '';
                        var closeAnsi_3 = '';
                        text = this.dataMatrix[rowIdx][1][colIdx].toString();
                        if (hasAnsi(text)) {
                            var ansi = getAnsi(text);
                            for (var i = 0; i < ansi.length / 2; i++) {
                                openAnsi_3 += ansi[i];
                            }
                            for (var i = ansi.length / 2; i < ansi.length; i++) {
                                closeAnsi_3 += ansi[i];
                            }
                        }
                        if (typeof replacer === 'function') {
                            var passObj_4 = {};
                            this.dataMatrix[rowIdx][1].forEach(function (i, idx) {
                                passObj_4[_this.header[idx]] = removeAnsi(i);
                            });
                            var cb = replacer(removeAnsi(text), passObj_4, rowIdx);
                            var isArray = true;
                            if (typeof cb !== 'object' || typeof cb.length === 'undefined') {
                                cb = forceString_1(cb);
                                isArray = false;
                            }
                            this.dataMatrix[rowIdx][1][colIdx] = isArray ? cb.map(function (i) { return openAnsi_3 + i + closeAnsi_3; }) : openAnsi_3 + cb + closeAnsi_3;
                            return this.dataMatrix[rowIdx][1][colIdx];
                        }
                    }
                }
            }
        }
        return forceString(text);
    };
    TableCLI.prototype.setData = function (data, flipTable) {
        var _this = this;
        if (data === void 0) { data = {}; }
        if (flipTable === void 0) { flipTable = false; }
        this.flipTable = flipTable;
        this.options.flipTable = flipTable;
        var _a = require('./helpers/rows'), correctData = _a.correctData, tableMatrix = _a.tableMatrix, tableHeader = _a.tableHeader;
        var _b = require('./helpers/utils'), loop = _b.loop, keys = _b.keys;
        data = correctData(data);
        this.dataMatrix = tableMatrix(data, flipTable);
        this.maxRows = this.dataMatrix.length;
        this.header = tableHeader(data);
        data = null;
        this.headerAlias = this.header.slice();
        loop(this.config.header, function (col, prop, val) {
            var colPosition = _this.header.indexOf(col);
            if (colPosition !== -1 && prop.toLowerCase() === 'alias' && _this.headerAlias[colPosition] !== val) {
                _this.headerAlias[colPosition] = val;
            }
        });
        if (typeof this.config.showHeader === 'boolean') {
            this.showHeader = this.config.showHeader;
        }
        /**
         * AutoComplete columns properties
         */
        this.header.forEach(function (item, index) {
            if (typeof _this.config.header[item] === "undefined") {
                _this.config.header[item] = {};
            }
            if (typeof _this.config.header[item]['align'] === "undefined") {
                _this.config.header[item]['align'] = _this.config.globalOptions.align;
            }
            if (['left', 'center', 'right'].indexOf(_this.config.header[item]['align'].toLowerCase()) === -1) {
                _this.config.header[item]['align'] = _this.globalOptions.align;
            }
            if (typeof _this.config.header[item]['valign'] === "undefined") {
                _this.config.header[item]['valign'] = _this.config.globalOptions.valign;
            }
            if (['top', 'middle', 'bottom'].indexOf(_this.config.header[item]['valign'].toLowerCase()) === -1) {
                _this.config.header[item]['valign'] = _this.globalOptions.valign;
            }
            if (typeof _this.config.header[item]['alias'] === "undefined") {
                _this.config.header[item]['alias'] = item;
            }
            if (typeof _this.config.header[item]['wordWrap'] === "undefined") {
                _this.config.header[item]['wordWrap'] = _this.config.globalOptions.wordWrap;
            }
            if (typeof _this.config.header[item]['width'] === "undefined") {
                _this.config.header[item]['width'] = _this.config.globalOptions.width;
            }
            if (typeof _this.config.header[item]['trimFrom'] === "undefined") {
                _this.config.header[item]['trimFrom'] = _this.config.globalOptions.trimFrom;
            }
            if (typeof _this.config.header[item]['show'] === "undefined") {
                _this.config.header[item]['show'] = true;
            }
            if (typeof _this.config.header[item]['paddingLeft'] === "undefined" || typeof +_this.config.header[item]['paddingLeft'] !== "number") {
                _this.config.header[item]['paddingLeft'] = _this.config.globalOptions.paddingLeft;
            }
            if (typeof _this.config.header[item]['paddingRight'] === "undefined" || typeof +_this.config.header[item]['paddingRight'] !== "number") {
                _this.config.header[item]['paddingRight'] = _this.config.globalOptions.paddingRight;
            }
            if (typeof _this.config.header[item]['priority'] === "undefined" || typeof +_this.config.header[item]['priority'] !== "number") {
                /**
                 * Auto-increment priority for columns
                 * The columns with the highest priority will be removed
                 * @type {number}
                 */
                _this.config.header[item]['priority'] = (function () {
                    var tch = _this.config.header;
                    var nextPrio = _this.header
                        .map(function (i) { return +(typeof tch[i] === 'undefined' || typeof tch[i]['priority'] === 'undefined' ? -1 : tch[i]['priority']); })
                        .filter(function (i) { return +i > 0; })
                        .sort(function (a, b) { return a - b; });
                    if (nextPrio.indexOf(1) === -1)
                        return 1;
                    nextPrio = nextPrio.filter(function (i, idx) { return (i - nextPrio[idx - 1]) === 1 || i === 1; });
                    return nextPrio[nextPrio.length - 1] + 1;
                })();
            }
        });
        return this;
    };
    TableCLI.prototype.space = function (text, columnStatus, textAlign, delimiter) {
        if (columnStatus === void 0) { columnStatus = []; }
        if (textAlign === void 0) { textAlign = "right"; }
        if (delimiter === void 0) { delimiter = ' '; }
        var _a = require('./helpers/ansi'), hasAnsi = _a.hasAnsi, getAnsi = _a.getAnsi, removeAnsi = _a.removeAnsi;
        var newText = text;
        var spaceDelimiter = delimiter;
        var openAnsi = '';
        var closeAnsi = '';
        if (hasAnsi(text)) {
            var ansi = getAnsi(text);
            for (var i = 0; i < ansi.length / 2; i++) {
                openAnsi += ansi[i];
            }
            for (var i = ansi.length / 2; i < ansi.length; i++) {
                closeAnsi += ansi[i];
            }
        }
        var cleanText = removeAnsi(text).trim();
        var paddingLeft = new Array(+columnStatus[2] + 1).join(spaceDelimiter);
        var paddingRight = new Array(+columnStatus[3] + 1).join(spaceDelimiter);
        var maxCellWidth = removeAnsi(text).length - paddingLeft.length - paddingRight.length; // +columnStatus[1];
        if (maxCellWidth > 0) {
            var spacesLeft = '';
            var spacesRight = '';
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
    };
    TableCLI.prototype.output = function (getOutput, rawData) {
        var _this = this;
        if (getOutput === void 0) { getOutput = false; }
        if (rawData === void 0) { rawData = false; }
        var removeAnsi = require('./helpers/ansi').removeAnsi;
        var prepareData = require('./helpers/rows').prepareData;
        var keys = require('./helpers/utils').keys;
        /**
         * Add HEADER COLUMN
         */
        if (this.showHeader) {
            var formattedAlias = this.headerAlias; //.map(i => chalk.bgCyan.whiteBright.bold(i));
            if (this.flipTable) {
                for (var _i = 0, _a = this.dataMatrix; _i < _a.length; _i++) {
                    var rowIndex = _a[_i][0];
                    this.dataMatrix[rowIndex][1].splice(0, 0, formattedAlias[rowIndex]);
                }
            }
            else {
                this.dataMatrix.splice(0, 0, [-1, formattedAlias]);
                this.dataMatrix = this.dataMatrix.map(function (item) {
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
        this.config = __assign({}, this.config, this.userConfig);
        this.options = __assign({}, this.options, this.config);
        var newData = prepareData(this.dataMatrix, this.options);
        this.columnStatus = newData[1];
        this.options = newData[2];
        newData = newData[0];
        var onlyRows = [];
        var rawDataOutput = newData;
        newData = newData
            .map(function (row, rowIdx) {
            /**
             * Vertical Alignment
             */
            var alignVertical = "middle";
            var maxRowsInRow = +row[1].map(function (i) { return i.length; }).sort(function (a, b) { return a > b; })[0];
            row[1] = row[1].map(function (i, idx) {
                var maxIlen = removeAnsi(i[0]).length;
                if (!_this.flipTable) {
                    alignVertical = _this.options.header[_this.options.tableColumns.header[idx]].valign;
                    if (_this.showHeader && rowIdx === 0) {
                        alignVertical = 'middle';
                    }
                }
                else {
                    alignVertical = _this.options.header[_this.options.tableColumns.header[rowIdx]].valign;
                }
                i = i.filter(function (ii) { return removeAnsi(ii.trim()).length; });
                if (alignVertical === 'middle') {
                    var topCells = Math.floor((maxRowsInRow - i.length) / 2);
                    var bottomCells = Math.ceil((maxRowsInRow - i.length) / 2);
                    for (var j = 0; j < topCells; j++) {
                        i.splice(0, 0, new Array(maxIlen + 1).join(' '));
                    }
                    for (var j = 0; j < bottomCells; j++) {
                        i.push(new Array(maxIlen + 1).join(' '));
                    }
                }
                if (['top', 'bottom'].indexOf(alignVertical.toLowerCase()) !== -1) {
                    for (var j = maxRowsInRow - i.length; j > 0; j--) {
                        if (alignVertical === 'top') {
                            i.push(new Array(maxIlen + 1).join(' '));
                        }
                        else {
                            i.splice(0, 0, new Array(maxIlen + 1).join(' '));
                        }
                    }
                }
                return i;
            });
            return row;
        })
            .map(function (row, rowIdx) {
            /**
             * Horizontal Alignment
             */
            var alignHorizontal = "right";
            row[1] = row[1].map((function (i, idx) {
                var cs = _this.columnStatus.filter(function (i) { return i[0] === idx; })[0];
                if (!_this.flipTable) {
                    alignHorizontal = _this.options.header[_this.options.tableColumns.header[cs[0]]].align;
                }
                else {
                    alignHorizontal = _this.options.header[_this.options.tableColumns.header[rowIdx]].align;
                    /**
                     * Force Header column to be centered
                     */
                    if (_this.showHeader) {
                        if (idx === 0) {
                            alignHorizontal = 'center';
                        }
                        else {
                            alignHorizontal = _this.options.header[_this.options.tableColumns.header[rowIdx]].align;
                        }
                    }
                }
                i = i.map(function (ii) { return _this.space(ii, cs, alignHorizontal); });
                /**
                 * Add +1 paddingTop && +1 paddingBottom to header and to flipped content
                 */
                if (_this.showHeader) {
                    if (_this.flipTable) {
                        var itemLen = removeAnsi(i[0]).length;
                        i.splice(0, 0, new Array(itemLen + 1).join(' '));
                        i.push(new Array(itemLen + 1).join(' '));
                        if (idx === 0) {
                            i = i.map(function (ii) { return chalk_1.default.white.bgCyan(ii); });
                        }
                    }
                    else {
                        if (rowIdx === 0) {
                            i.splice(0, 0, new Array(removeAnsi(i[rowIdx]).length + 1).join(' '));
                            i.push(new Array(removeAnsi(i[rowIdx]).length + 1).join(' '));
                            i = i.map(function (ii) { return chalk_1.default.white.bgCyan(ii); });
                        }
                    }
                }
                return i;
            }));
            return row;
        });
        var lastRowID = -1;
        newData.forEach(function (row, idx) {
            var rowId = row[0], rows = row[1];
            var _loop_1 = function (i) {
                var hold = [];
                rows.forEach(function (item, idx) {
                    if (idx === 0) {
                        hold.push('|');
                    }
                    hold.push(item[i]);
                    hold.push('|');
                });
                if (i === 0 && lastRowID !== rowId) {
                    lastRowID = rowId;
                    onlyRows.push([rowId, hold.map(function (i, idx) {
                            if (idx % 2 == 0) {
                                return rowId === 0 ? '-' : '|';
                            }
                            return new Array(removeAnsi(i).length + 1).join('–');
                        })]);
                }
                onlyRows.push([rowId, hold]);
            };
            for (var i = 0; i < rows[0].length; i++) {
                _loop_1(i);
            }
            if (idx === newData.length - 1) {
                onlyRows.push([rowId, onlyRows[0][1]]);
            }
        });
        if (getOutput) {
            if (rawData) {
                return rawDataOutput;
            }
            else {
                return onlyRows;
            }
        }
        else {
            onlyRows.forEach(function (item, index) {
                _this.console(item[1].join(''));
            });
        }
    };
    TableCLI.prototype.formatColumn = function (columnNameOrIndex, rowOrFn, replacer) {
        if (typeof rowOrFn === 'function') {
            replacer = rowOrFn;
            rowOrFn = -1;
        }
        else {
            rowOrFn = +rowOrFn;
            if (rowOrFn < 0 || typeof +rowOrFn !== 'number') {
                rowOrFn = -1;
            }
        }
        this.getColRow(columnNameOrIndex, rowOrFn, replacer);
        return this;
    };
    /**
     * Default output
     * @param {string} input
     */
    TableCLI.prototype.console = function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var chalk = require("chalk");
        console.log.apply(console, input.map(function (item) { return chalk.cyanBright.bold(item); }));
    };
    return TableCLI;
}());
module.exports = function (params) {
    return new TableCLI(params);
};
