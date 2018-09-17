var PrepareTableData = /** @class */ (function () {
    function PrepareTableData(data, config) {
        if (config === void 0) { config = {}; }
        this.data = [];
        this.config = {};
        this.columnStatus = [];
        this.colrec = 0;
        this.data = data;
        this.config = config;
        this.columnStatus = this.getColumnsStatus();
        this.keepColumnsThatFit();
    }
    PrepareTableData.prototype.readColumn = function (texts) {
        var removeAnsi = require('./ansi').removeAnsi;
        var forceString = require('./utils').forceString;
        var stackAvg = [];
        var nr = 0;
        if (texts.length) {
            texts.forEach(function (i, idx) {
                if ([null, undefined].indexOf(i) === -1) {
                    if (typeof i === "object") {
                        if (typeof i.length !== 'undefined') {
                            i.forEach(function (z, x) {
                                texts.splice(+idx + +x, (x === 0 ? 1 : 0), removeAnsi(forceString(z)));
                            });
                        }
                        else {
                            texts.splice(+idx, 0, removeAnsi(forceString(typeof i)));
                        }
                    }
                }
            });
            if (texts.length > 1) {
                texts.forEach(function (item, idx) {
                    var itemsWithoutItem = texts.filter(function (z, x) { return x !== idx; });
                    var avgWords = 0;
                    if (itemsWithoutItem.length) {
                        avgWords = itemsWithoutItem.map(function (i) { return i.length; }).reduce(function (a, b) { return a + b; }) / itemsWithoutItem.length;
                    }
                    stackAvg.push(avgWords);
                });
            }
            else {
                var recordLength = texts[0].length;
                stackAvg.push(recordLength);
            }
            nr = stackAvg.reduce(function (a, b) { return a + b; }) / stackAvg.length;
        }
        return Math.floor(nr);
    };
    PrepareTableData.prototype.prepareRow = function (columnIndex, row) {
        var _this = this;
        if (row === void 0) { row = []; }
        var newRow = [];
        var maxRowsFound = 0;
        /**
         * Create Rows
         */
        row.forEach(function (item, index) {
            var ndix = index;
            if (_this.config.flipTable) {
                ndix = columnIndex;
            }
            var newItem = _this.splitText(item, index, ndix);
            if (maxRowsFound < newItem.length) {
                maxRowsFound = newItem.length;
            }
            newRow.push(newItem);
        });
        /**
         * Add empty cells to complete rows
         */
        newRow.forEach(function (item, index) {
            var maxWidth = _this.columnStatus[index][1];
            if (item.length < maxRowsFound) {
                for (var i = 0; i < maxRowsFound - item.length; i++) {
                    newRow[index] = newRow[index].concat(_this.space('', maxWidth, 'right'));
                }
            }
        });
        return newRow;
    };
    ;
    PrepareTableData.prototype.isNormal = function (normalValue, flipValue) {
        if (normalValue === void 0) { normalValue = ""; }
        if (flipValue === void 0) { flipValue = ""; }
        if (typeof normalValue === 'function') {
            normalValue = normalValue();
        }
        if (typeof flipValue === 'function') {
            flipValue = flipValue();
        }
        return this.config.flipTable ? flipValue : normalValue;
    };
    /**
     * Correct new lines
     */
    PrepareTableData.prototype.textNoBreak = function (txt, pattern) {
        var _this = this;
        if (txt === void 0) { txt = ''; }
        if (pattern === void 0) { pattern = '\r\n'; }
        var newTxt = [];
        var breaks = ['\r\n', '\r', '\n'];
        var patternIdx = breaks.indexOf(pattern);
        var st = !txt.split(pattern).length ? [txt] : txt.split(pattern);
        st.forEach(function (i) {
            if (typeof breaks[patternIdx + 1] !== 'undefined') {
                newTxt = newTxt.concat(_this.textNoBreak(i, breaks[patternIdx + 1]));
            }
            else {
                newTxt = newTxt.concat(i);
            }
        });
        return newTxt;
    };
    ;
    PrepareTableData.prototype.splitText = function (text, columnIndex, rowIndex) {
        var _this = this;
        if (text === void 0) { text = ''; }
        var _a = require('./ansi'), removeAnsi = _a.removeAnsi, getAnsi = _a.getAnsi, hasAnsi = _a.hasAnsi;
        var boomText = [];
        var mainIndex = this.isNormal(columnIndex, rowIndex);
        var width = this.columnStatus[columnIndex][1];
        var col = this.config.tableColumns.header[mainIndex];
        var wordWrap = this.config.header[col].wordWrap;
        var paddingLeft = +this.config.header[col].paddingLeft;
        var paddingRight = +this.config.header[col].paddingRight;
        var maxWidth = width;
        maxWidth = maxWidth - paddingLeft - paddingRight;
        if (typeof text !== 'object') {
            text = [text];
        }
        var readNewLines = [];
        text.forEach(function (txt) {
            var pattern = new RegExp('\r|\r\n|\n', 'g');
            if (pattern.test(txt)) {
                _this.textNoBreak(txt).forEach(function (i) { return readNewLines = readNewLines.concat(i); });
            }
            else {
                readNewLines = readNewLines.concat(txt);
            }
        });
        text = readNewLines;
        readNewLines = null;
        text.forEach(function (text) {
            text = text.trim();
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
            var splitParts = !maxWidth ? 0 : Math.ceil(cleanText.length / maxWidth);
            if (wordWrap) {
                var wordBreak = cleanText.split(' ');
                var stack_1 = [];
                var wordStack_1 = [];
                /**
                 * Split long words
                 */
                wordBreak.forEach(function (word) {
                    if (word.length > maxWidth) {
                        if (maxWidth <= 0) {
                            wordStack_1.push(word);
                        }
                        else {
                            var wordSplit = !maxWidth ? 0 : Math.ceil(word.length / maxWidth);
                            for (var i = 0; i < wordSplit; i++) {
                                wordStack_1.push(word.substr(i * maxWidth, maxWidth));
                            }
                        }
                    }
                    else {
                        wordStack_1.push(word);
                    }
                });
                wordStack_1.map(function (i) { return i.trim(); }).forEach(function (word, idx) {
                    var nextWordLen = typeof wordStack_1[idx + 1] === 'undefined' ? 0 : wordStack_1[idx + 1].length + 1;
                    stack_1.push(word);
                    if ((stack_1.join(' ').length + nextWordLen) > maxWidth) {
                        boomText = boomText.concat(nbsp(paddingLeft) + openAnsi + _this.space(stack_1.join(' ').trim(), maxWidth, 'right') + closeAnsi + nbsp(paddingRight));
                        stack_1 = [];
                    }
                    else {
                        if (idx === wordStack_1.length - 1) {
                            boomText = boomText.concat(nbsp(paddingLeft) + openAnsi + _this.space(stack_1.join(' ').trim(), maxWidth, 'right') + closeAnsi + nbsp(paddingRight));
                        }
                    }
                });
            }
            else {
                for (var i = 0; i < splitParts; i++) {
                    boomText = boomText.concat(nbsp(paddingLeft) + openAnsi + _this.space(cleanText.substr(i * maxWidth, maxWidth).trim(), maxWidth, 'right') + closeAnsi + nbsp(paddingRight));
                }
            }
        });
        return boomText;
    };
    ;
    PrepareTableData.prototype.detectMaxWidth = function (row, totalColumns, maxWidth, columnsInfo, props) {
        if (row === void 0) { row = []; }
        if (totalColumns === void 0) { totalColumns = 0; }
        if (maxWidth === void 0) { maxWidth = 0; }
        if (columnsInfo === void 0) { columnsInfo = []; }
        if (props === void 0) { props = {}; }
        var removeAnsi = require('./ansi').removeAnsi;
        var forceString = require('./utils').forceString;
        var removeThisLength = 0;
        if (props.hasOwnProperty('paddingLeft')) {
            removeThisLength = removeThisLength + props.paddingLeft;
        }
        if (props.hasOwnProperty('paddingRight')) {
            removeThisLength = removeThisLength + props.paddingRight;
        }
        var col = [];
        var maxCellWidth = 0;
        row.forEach(function (i) {
            if ([null, undefined].indexOf(i) === -1) {
                if (typeof i === "object") {
                    if (typeof i.length !== 'undefined') {
                        i.forEach(function (z) {
                            z = removeAnsi(z.trim());
                            if (z.length > maxCellWidth) {
                                maxCellWidth = z.length;
                            }
                            col.push(removeAnsi(forceString(z)));
                        });
                    }
                    else {
                        col.push(removeAnsi(forceString(typeof i)));
                    }
                }
                else {
                    i = removeAnsi(i.trim());
                    if (i.length > maxCellWidth) {
                        maxCellWidth = i.length;
                    }
                    col.push(removeAnsi(forceString(i)));
                }
            }
        });
        var autoWidth = Math.floor(maxWidth / totalColumns);
        var columnAnalysis = this.readColumn(row) + removeThisLength;
        if (columnAnalysis > this.config.terminalWidth) {
            columnAnalysis = this.config.terminalWidth - totalColumns * 2 - 1;
        }
        if (columnAnalysis >= this.config.terminalWidth) {
            columnAnalysis = removeThisLength + autoWidth;
        }
        var avg = 0;
        if (col.length) {
            avg = (col.map(function (i) { return i.length; }).reduce(function (a, b) { return a + b; }) / col.length) + removeThisLength;
            /**
             * Add +15%
             */
            avg += avg * 0.15;
            if (avg !== Math.floor(avg)) {
                avg = Math.floor(avg);
            }
        }
        /**
         * Column Analysis | Average width | autoWidth
         */
        return [columnAnalysis, avg, autoWidth, maxCellWidth];
    };
    PrepareTableData.prototype.keepColumnsThatFit = function () {
        var _this = this;
        var keepCols = [];
        var tempTerminalWidth = this.config.terminalWidth;
        if (this.config.flipTable) {
            this.columnStatus.forEach(function (col) {
                var width = col[1];
                if (tempTerminalWidth - width > 0) {
                    tempTerminalWidth = tempTerminalWidth - width;
                    keepCols.push(col);
                }
                else {
                    _this.data = _this.data.map(function (r) {
                        r[1] = r[1].filter(function (v, i) { return i < keepCols.length; });
                        return r;
                    });
                }
            });
            this.columnStatus = keepCols;
        }
    };
    PrepareTableData.prototype.space = function (text, maxCellWidth, textAlign, delimiter) {
        if (maxCellWidth === void 0) { maxCellWidth = 0; }
        if (textAlign === void 0) { textAlign = "right"; }
        if (delimiter === void 0) { delimiter = ' '; }
        var newText = text;
        if (maxCellWidth) {
            var spaceDelimiter = delimiter;
            var spacesLeft = '';
            var spacesRight = '';
            if (textAlign === 'left') {
                spacesRight = new Array(maxCellWidth - text.length + 1).join(spaceDelimiter);
            }
            if (textAlign === 'center') {
                spacesLeft = new Array(Math.floor((maxCellWidth - text.length) / 2) + 1).join(spaceDelimiter);
                spacesRight = new Array(Math.ceil((maxCellWidth - text.length) / 2) + 1).join(spaceDelimiter);
            }
            if (textAlign === 'right') {
                spacesLeft = new Array(maxCellWidth - text.length + 1).join(spaceDelimiter);
            }
            newText = spacesLeft + text + spacesRight;
        }
        return newText;
    };
    /**
     * Detect columns width
     * @returns {(string | number)[][]}
     */
    PrepareTableData.prototype.getColumnsStatus = function () {
        var _this = this;
        this.colrec = this.colrec + 1;
        if (!this.data.length) {
            return [];
        }
        /**
         * Search for columns with "auto"
         */
        var autoColumns = [];
        var fixedSize = 0;
        var columnFloored = false;
        var foundColumnWidth = [];
        var originalMaxColumns = this.data[0][1].length;
        var maxColumns = originalMaxColumns;
        var diffDelimiters = maxColumns + 1;
        var flipTable = this.config.flipTable;
        var columnIndex = [];
        /**
         * Remove hidden columns
         */
        var removeHiddenColumns = function () {
            _this.config.tableColumns.header.forEach(function (item, index) {
                if (_this.config.header[item].show === false) {
                    if (_this.config.flipTable) {
                        _this.data = _this.data.filter(function (itm, idx) {
                            return itm[0] !== index;
                        });
                        /**
                         * Reindex rows
                         * @type {[number , string[]][]}
                         */
                        _this.data = _this.data.map(function (itm, idx) {
                            itm[0] = idx;
                            return itm;
                        });
                    }
                    else {
                        _this.data = _this.data.map(function (itm) {
                            itm[1] = itm[1].filter(function (itm2, idx2) {
                                return idx2 !== index;
                            });
                            return itm;
                        });
                    }
                    delete _this.config.header[item];
                    _this.config.tableColumns.header = _this.config.tableColumns.header.filter(function (i) { return i !== item; });
                }
            });
            /**
             * Update variables
             */
            if (!_this.config.flipTable) {
                maxColumns = _this.config.tableColumns.header.length;
                diffDelimiters = maxColumns + 1;
            }
        };
        removeHiddenColumns();
        if (originalMaxColumns !== maxColumns) {
            return this.getColumnsStatus();
        }
        /**
         * STEP 1
         * Detecting normal width for columns
         */
        var zeroWidth = false;
        if (flipTable) {
            autoColumns = new Array(this.data.length + 1);
        }
        else {
            this.config.tableColumns.header.forEach(function (item) {
                if (_this.config.header[item].width === 'auto') {
                    autoColumns.push(item);
                    foundColumnWidth.push([item, 'auto']);
                }
                else {
                    var percentageConst = +_this.config.header[item].width;
                    if (typeof _this.config.header[item].width === 'string' && (/^[0-9\.]+%$/).test(_this.config.header[item].width)) {
                        var nrProc = +_this.config.header[item].width.replace(/[^0-9\.]/g, '');
                        percentageConst = !Math.floor(nrProc) ? 0 : (nrProc / 100) * _this.config.terminalWidth;
                    }
                    if (!Math.floor(percentageConst)) {
                        _this.config.header[item].width = 'auto';
                        _this.config.header[item].show = false;
                        zeroWidth = true;
                    }
                    else {
                        var roundedValue = Math.floor(percentageConst);
                        if (!isNaN(roundedValue)) {
                            if (roundedValue !== percentageConst) {
                                if (columnFloored) {
                                    roundedValue = Math.ceil(percentageConst);
                                    columnFloored = false;
                                }
                                else {
                                    columnFloored = true;
                                }
                            }
                            /**
                             * Set for removal columns with padding bigger than length
                             * Remove -1px (border)
                             */
                            if (Math.floor(roundedValue - 1) <= (+_this.config.header[item].paddingRight + +_this.config.header[item].paddingLeft)) {
                                _this.config.header[item].width = 'auto';
                                _this.config.header[item].show = false;
                                zeroWidth = true;
                            }
                            fixedSize = fixedSize + roundedValue;
                            foundColumnWidth.push([item, roundedValue]);
                        }
                        else {
                            /**
                             * Fallback to "auto"
                             */
                            autoColumns.push(item);
                            foundColumnWidth.push([item, 'auto']);
                        }
                    }
                }
            });
        }
        /**
         * Remove columns with 0 width
         */
        if (zeroWidth) {
            removeHiddenColumns();
            if (originalMaxColumns !== maxColumns) {
                return this.getColumnsStatus();
            }
        }
        var remainingWidth = this.config.terminalWidth - fixedSize - diffDelimiters;
        var removeAnsi = require('./ansi').removeAnsi;
        var forceString = require('./utils').forceString;
        var getColumnDimensions = function (col, colIndex, width) {
            if (width === void 0) { width = "auto"; }
            return [colIndex, width.toString()];
        };
        var columnsInfo = [];
        for (var i = 0; i < originalMaxColumns; i++) {
            var gvc = this.getVisualColumn(i);
            columnIndex.push(gvc);
            columnsInfo.push(getColumnDimensions(columnIndex[columnIndex.length - 1], i, flipTable ? "auto" : foundColumnWidth[i][1].toString()));
        }
        /**
         * Add Padding
         */
        var maxPaddingLeft = this.config.globalOptions.paddingLeft;
        var maxPaddingRight = this.config.globalOptions.paddingRight;
        this.config.tableColumns.header.forEach(function (item) {
            if (_this.config.header[item].paddingLeft > maxPaddingLeft) {
                maxPaddingLeft = _this.config.header[item].paddingLeft;
            }
            if (_this.config.header[item].paddingRight > maxPaddingRight) {
                maxPaddingRight = _this.config.header[item].paddingRight;
            }
        });
        columnsInfo = columnsInfo.map(function (item, idx) {
            if (flipTable) {
                item.push(maxPaddingLeft);
                item.push(maxPaddingRight);
            }
            else {
                item.push(_this.config.header[_this.config.tableColumns.header[idx]].paddingLeft);
                item.push(_this.config.header[_this.config.tableColumns.header[idx]].paddingRight);
            }
            return item;
        });
        var auto = columnsInfo.filter(function (i) { return i[1] === 'auto'; });
        /**
         * Remove borders from columns Width
         */
        columnsInfo = columnsInfo.map(function (item, idx) {
            if (item[1] !== 'auto') {
                item[1] = +item[1] - (idx === 0 ? 2 : 1);
            }
            return item;
        });
        var recursiveNr = 0;
        /**
         * Reassign width to fit more columns
         */
        var canWeFit = function (width) {
            if (width === void 0) { width = 0; }
            if (width > 0) {
                var spaceRetrieved_1 = [];
                var ids_1 = auto.map(function (a) { return +a[0]; });
                columnIndex.forEach(function (i, idx) {
                    if (ids_1.indexOf(idx) !== -1) {
                        var maxLen = i.map(function (l) { return (l.length > columnsInfo[idx][1] ? +columnsInfo[idx][1] : l.length) + +columnsInfo[idx][2] + +columnsInfo[idx][3]; }).sort(function (a, b) { return +a + +b; })[0];
                        if (maxLen > 0 && maxLen < +columnsInfo[idx][1]) {
                            spaceRetrieved_1.push([idx, +columnsInfo[idx][1] - maxLen]);
                        }
                    }
                });
                if (spaceRetrieved_1.length) {
                    /**
                     * Sort desc by the number of free cells
                     */
                    spaceRetrieved_1 = spaceRetrieved_1.sort(function (a, b) {
                        return a[1] < b[1];
                    });
                    var totalFreeCells = spaceRetrieved_1.map(function (i) { return i[1]; }).reduce(function (a, b) { return a + b; });
                    if (totalFreeCells >= width) {
                        var colIdx = spaceRetrieved_1[0][0];
                        columnsInfo[colIdx][1] = +columnsInfo[colIdx][1] - 1;
                        return canWeFit(width - 1);
                    }
                }
            }
            return false;
        };
        var fixLargeColumns = function () {
            var ids = auto.map(function (a) { return +a[0]; });
            var columnsPercentage = columnsInfo
                .filter(function (i) { return ids.indexOf(+i[0]) !== -1; })
                .map(function (i) {
                var proc = Math.floor(+i[1] / _this.config.terminalWidth * 100);
                if (typeof i[4] === 'undefined') {
                    i.push(proc);
                }
                else {
                    i[4] = proc;
                }
                return i;
            }).sort(function (a, b) { return a[4] < b[4]; });
            var largestItem = columnsPercentage[0];
            var averageItems = columnsPercentage.filter(function (i, x) { return x > 0; });
            if (averageItems.length) {
                averageItems = Math.floor(averageItems.map(function (i) { return i[1]; }).reduce(function (a, b) { return a + b; }) / averageItems.length);
            }
            else {
                averageItems = 1;
            }
            if (largestItem[1] > averageItems * 2.5 && columnsInfo.length > 1) {
                columnsPercentage[0][1] = averageItems + Math.ceil(averageItems * 0.15);
                columnsInfo = columnsInfo.map(function (item) {
                    if (item[0] === largestItem[0]) {
                        item[1] = largestItem[1];
                    }
                    return item;
                });
                return fixLargeColumns();
            }
        };
        var columnWordsAvg = [];
        var columnsWereRemoved = false;
        var redistributeWidth = function () {
            recursiveNr++;
            if (auto.length && autoColumns.length) {
                var ids_2 = auto.map(function (a) { return +a[0]; });
                auto.forEach(function (itm) {
                    var autoIdx = itm[0];
                    if (recursiveNr === 1)
                        columnIndex.forEach(function (row, idx) {
                            if (ids_2.indexOf(idx) !== -1 && autoIdx === idx) {
                                var cmw = _this.detectMaxWidth(row, _this.isNormal(+maxColumns, auto.length), remainingWidth, columnsInfo, {
                                    paddingLeft: columnsInfo[idx][2],
                                    paddingRight: columnsInfo[idx][3]
                                });
                                if (typeof columnWordsAvg[idx] === 'undefined') {
                                    cmw.push(idx);
                                    columnWordsAvg.push(cmw);
                                }
                                columnsInfo[idx][1] = cmw[0];
                                fixLargeColumns();
                            }
                        });
                });
                if (recursiveNr === 1)
                    columnsInfo.forEach(function (i) { return canWeFit(+i[1]); });
                var totalWidth = columnsInfo.map(function (i) { return +i[1]; }).reduce(function (a, b) { return a + b; }) + columnsInfo.length + 1;
                remainingWidth = _this.config.terminalWidth - totalWidth;
                if (totalWidth > _this.config.terminalWidth && columnsInfo.length > 1) {
                    columnsWereRemoved = true;
                    if (_this.config.flipTable) {
                        var lastAuto_1 = auto[auto.length - 1];
                        remainingWidth = +remainingWidth + +lastAuto_1[1];
                        auto = auto.filter(function (i, idx) { return idx !== auto.length - 1; });
                        columnsInfo = columnsInfo.filter(function (i, idx) { return idx !== columnsInfo.length - 1; });
                        columnIndex = columnIndex.filter(function (i, idx) { return idx !== columnIndex.length - 1; });
                        columnWordsAvg = columnWordsAvg.filter(function (i) { return +i[4] !== +lastAuto_1[0]; });
                        _this.data = _this.data.map(function (i) {
                            i[1] = i[1].filter(function (ii, xx) { return xx !== i[1].length - 1; });
                            return i;
                        });
                        maxColumns = +maxColumns - 1;
                        return redistributeWidth();
                    }
                    else {
                        /**
                         * We'll remove first 'auto' columns with highest 'priority'
                         * If we don't have any 'auto' columns we'll remove the columns with highest 'priority'
                         */
                        var lastAutoCol_1 = "";
                        var priority_1 = 0;
                        autoColumns.forEach(function (col) {
                            if (typeof _this.config.header[col] !== 'undefined' && _this.config.header[col].priority > priority_1) {
                                priority_1 = _this.config.header[col].priority;
                                lastAutoCol_1 = col;
                            }
                        });
                        var lastAutoColIdx_1 = _this.config.tableColumns.header.indexOf(lastAutoCol_1);
                        auto = auto.filter(function (i) { return i[0] !== lastAutoColIdx_1; });
                        autoColumns = autoColumns.filter(function (i) { return i !== lastAutoCol_1; });
                        columnsInfo = columnsInfo.filter(function (i, idx) { return idx !== lastAutoColIdx_1; }).map(function (i, idx) {
                            i[0] = idx;
                            return i;
                        });
                        columnIndex = columnIndex.filter(function (i, idx) { return idx !== lastAutoColIdx_1; });
                        columnWordsAvg = columnWordsAvg.filter(function (i) { return +i[4] !== +lastAutoColIdx_1; });
                        delete _this.config.header[lastAutoCol_1];
                        _this.config.tableColumns.header = _this.config.tableColumns.header.filter(function (i) { return i !== lastAutoCol_1; });
                        _this.data = _this.data.map(function (i) {
                            i[1] = i[1].filter(function (ii, xx) { return xx !== lastAutoColIdx_1; });
                            return i;
                        });
                        maxColumns = +maxColumns - 1;
                        return redistributeWidth();
                    }
                }
                else {
                    var ids_3 = auto.map(function (a) { return +a[0]; });
                    var ci_1 = columnsInfo;
                    /**
                     * Cell Width > MaxColumnWidth will be reset to MaxColumnWidth
                     */
                    columnsInfo = columnsInfo.map(function (i, idx) {
                        if (ids_3.indexOf(idx) !== -1)
                            columnWordsAvg.forEach(function (ii) {
                                var colInfoIndex = +i[0];
                                var avgInfoIndex = +ii[4];
                                var curCol = +i[1];
                                var paddingLeft = +i[2];
                                var paddingRight = +i[3];
                                var maxColWidth = +ii[3] + paddingLeft + paddingRight;
                                if (colInfoIndex === avgInfoIndex && maxColWidth < curCol) {
                                    remainingWidth = remainingWidth + +i[1] - +maxColWidth;
                                    i[1] = maxColWidth;
                                }
                            });
                        return i;
                    });
                    /**
                     * Add remaining width
                     */
                    var newTotal_1 = columnsInfo.map(function (i) { return +i[1]; }).reduce(function (a, b) { return a + b; }) + columnsInfo.length + 1;
                    var tablePercentage = Math.floor((newTotal_1 / _this.config.terminalWidth) * 100);
                    var increaseSmallestColumn_1 = function (width) {
                        if (width === void 0) { width = 0; }
                        if (width > 0) {
                            var ciRemainingAuto = ci_1.filter(function (x, xx) { return ids_3.indexOf(xx) !== -1; });
                            // .filter((x:any,xx:any)=> ids.indexOf(xx) !== -1)
                            var sortAsc = ciRemainingAuto
                                .sort(function (a, b) { return +a[1] - +b[1]; })
                                .map(function (i) { return i.map(function (ii) { return +ii; }); });
                            var smallestColumn_1 = sortAsc[0];
                            columnsInfo.forEach(function (i, idx) {
                                if (ids_3.indexOf(idx) !== -1 && +i[0] === +smallestColumn_1[0]) {
                                    remainingWidth = remainingWidth - 1;
                                    columnsInfo[idx][1] = +columnsInfo[idx][1] + 1;
                                }
                            });
                            return increaseSmallestColumn_1(--width);
                        }
                        return false;
                    };
                    if (columnsWereRemoved && remainingWidth > 0 || (!_this.config.flipTable && tablePercentage > 60)) {
                        increaseSmallestColumn_1(remainingWidth);
                    }
                    else {
                        columnsInfo = columnsInfo.map(function (i, idx) {
                            if (ids_3.indexOf(idx) !== -1)
                                columnWordsAvg.forEach(function (ii) {
                                    newTotal_1 = columnsInfo.map(function (i) { return +i[1]; }).reduce(function (a, b) { return a + b; }) + columnsInfo.length + 1;
                                    var maxColWidth = +ii[3] + +i[2] + +i[3];
                                    if (+i[0] === +ii[4] && remainingWidth > 0) {
                                        var maxCellWidthNoPad = +ii[3];
                                        var padding = +i[2] + +i[3];
                                        var average = +ii[1];
                                        var currCol = +i[1];
                                        if (maxCellWidthNoPad / currCol < 2) {
                                            remainingWidth = remainingWidth - maxCellWidthNoPad;
                                            i[1] = maxColWidth;
                                        }
                                        else {
                                            if ((newTotal_1 + ii[0]) <= _this.config.terminalWidth) {
                                                remainingWidth = remainingWidth - maxCellWidthNoPad - currCol - padding;
                                                i[1] = average;
                                            }
                                        }
                                    }
                                });
                            return i;
                        });
                    }
                }
            }
        };
        redistributeWidth();
        return columnsInfo;
    };
    /**
     * Get the cells from a COLUMN = works with normal and flip table
     * @param {number} columnIndex
     * @returns {string[]}
     */
    PrepareTableData.prototype.getVisualColumn = function (columnIndex) {
        var stack = [];
        this.data.forEach(function (item) {
            if (item[1].hasOwnProperty(columnIndex)) {
                stack.push(item[1][columnIndex]);
            }
        });
        return stack;
    };
    ;
    return PrepareTableData;
}());
var prepareData = function (data, config) {
    var ptd = new PrepareTableData(data, config);
    var formattedRows = [];
    for (var _i = 0, _a = ptd.data; _i < _a.length; _i++) {
        var _b = _a[_i], rowIndex = _b[0], row = _b[1];
        var prepRow = ptd.prepareRow(rowIndex, row);
        formattedRows.push([rowIndex, prepRow]);
    }
    return [formattedRows, ptd.columnStatus, ptd.config];
};
/**
 * Create a space
 * @param {number} howMany
 * @returns {string}
 */
var nbsp = function (howMany) {
    if (howMany === void 0) { howMany = 0; }
    return new Array(howMany + 1).join(' ');
};
var getRealIndex = function (idx, maxArrayLen) {
    if (idx >= maxArrayLen) {
        idx = idx - maxArrayLen;
    }
    return idx < maxArrayLen ? idx : getRealIndex(idx, maxArrayLen);
};
/**
 * Format header
 * @param data
 * @returns {string[]}
 */
var tableHeader = function (data) {
    if (data === void 0) { data = {}; }
    var columns = [];
    for (var record in data) {
        if (data.hasOwnProperty(record)) {
            for (var columnName in data[record]) {
                if (data[record].hasOwnProperty(columnName) && columns.indexOf(columnName) === -1) {
                    columns.push(columnName);
                }
            }
        }
    }
    return columns;
};
/**
 * Add missing columns if data is incomplete
 * @param data
 * @returns {any}
 */
var correctData = function (data) {
    var objectColumns = [];
    var _a = require('./utils'), loop = _a.loop, keys = _a.keys;
    /**
     * Get all columns
     */
    loop(data, function (key, column) {
        if (objectColumns.indexOf(column) === -1) {
            objectColumns.push(column);
        }
    });
    /**
     * Fill all records with the missing columns
     */
    loop(data, function (key, column) {
        var objKeys = keys(data[key]);
        if (objKeys.length !== objectColumns.length) {
            var fillWithColumns = objectColumns.filter(function (i) { return objKeys.indexOf(i) === -1; });
            fillWithColumns.forEach(function (i) {
                data[key][i] = '';
            });
        }
        if (objectColumns.indexOf(column) === -1) {
            objectColumns.push(column);
        }
    });
    /**
     * Sort all records columns based on objectColumns
     */
    var sortedData = {};
    objectColumns.forEach(function (col) {
        for (var key in data) {
            if (data.hasOwnProperty(key) && data[key].hasOwnProperty(col)) {
                if (typeof sortedData[key] === 'undefined') {
                    sortedData[key] = {};
                }
                if (typeof sortedData[key][col] === 'undefined') {
                    sortedData[key][col] = '';
                }
                sortedData[key][col] = data[key][col];
            }
        }
    });
    return sortedData;
};
/**
 * Format data
 * @param data
 * @param {boolean} flipData
 * @returns {[number , string[]][]}
 */
var tableMatrix = function (data, flipData) {
    if (data === void 0) { data = {}; }
    if (flipData === void 0) { flipData = false; }
    var forceString = require('./utils').forceString;
    var matrix = [];
    var i = 0;
    var stackFlip = {};
    for (var record in data) {
        if (data.hasOwnProperty(record)) {
            var stackisNormal = [];
            for (var columnName in data[record]) {
                if (data[record].hasOwnProperty(columnName)) {
                    if (flipData) {
                        if (typeof stackFlip[columnName] === 'undefined') {
                            stackFlip[columnName] = [];
                        }
                        stackFlip[columnName].push(forceString(data[record][columnName]));
                    }
                    else {
                        stackisNormal.push(forceString(data[record][columnName]));
                    }
                }
            }
            if (!flipData) {
                matrix.push([i, stackisNormal]);
                i++;
            }
        }
    }
    if (flipData) {
        var idx = 0;
        for (var itm in stackFlip) {
            if (stackFlip.hasOwnProperty(itm)) {
                matrix.push([idx++, stackFlip[itm]]);
            }
        }
    }
    return matrix;
};
exports.correctData = correctData;
exports.tableMatrix = tableMatrix;
exports.tableHeader = tableHeader;
exports.prepareData = prepareData;
