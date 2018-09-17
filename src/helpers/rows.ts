class PrepareTableData {

    data: [number, string[]][] = [];
    config: any = {};
    columnStatus: any = [];
    colrec: number = 0;

    constructor(data: [number, string[]][], config: any = {}) {

        this.data = data;
        this.config = config;
        this.columnStatus = this.getColumnsStatus();

        this.keepColumnsThatFit();

    }

    readColumn(texts: any[]): number {

        let {removeAnsi} = require('./ansi');
        let {forceString} = require('./utils');
        let stackAvg: number[] = [];
        let nr: number = 0;

        if (texts.length) {

            texts.forEach((i: any, idx) => {

                if ([null, undefined].indexOf(i) === -1) {

                    if (typeof i === "object") {

                        if (typeof i.length !== 'undefined') {

                            i.forEach((z: string, x: number) => {

                                texts.splice(+idx + +x, (x === 0 ? 1 : 0), removeAnsi(forceString(z)));

                            })

                        } else {

                            texts.splice(+idx, 0, removeAnsi(forceString(typeof i)));

                        }

                    }

                }

            });

            if (texts.length > 1) {


                texts.forEach((item, idx) => {

                    let itemsWithoutItem = texts.filter((z, x) => x !== idx);
                    let avgWords: number = 0;

                    if (itemsWithoutItem.length) {

                        avgWords = itemsWithoutItem.map((i: any) => i.length).reduce((a: any, b: any) => a + b) / itemsWithoutItem.length;

                    }

                    stackAvg.push(avgWords);

                });

            } else {

                let recordLength: number = texts[0].length;

                stackAvg.push(recordLength);

            }

            nr = stackAvg.reduce((a: any, b: any) => a + b) / stackAvg.length;

        }

        return Math.floor(nr);

    }

    prepareRow(columnIndex: number, row: string[] = []): string[][] {

        let newRow: string[][] = [];

        let maxRowsFound: number = 0;

        /**
         * Create Rows
         */
        row.forEach((item, index) => {

            let ndix: number = index;

            if (this.config.flipTable) {
                ndix = columnIndex;
            }

            let newItem: string[] = this.splitText(item, index, ndix);

            if (maxRowsFound < newItem.length) {

                maxRowsFound = newItem.length;

            }

            newRow.push(newItem);

        });

        /**
         * Add empty cells to complete rows
         */
        newRow.forEach((item, index) => {

            let maxWidth: number = this.columnStatus[index][1];

            if (item.length < maxRowsFound) {

                for (let i = 0; i < maxRowsFound - item.length; i++) {

                    newRow[index] = newRow[index].concat(this.space('', maxWidth, 'right'));

                }

            }

        });

        return newRow;

    };

    private isNormal(normalValue: any = "", flipValue: any = "") {

        if (typeof normalValue === 'function') {

            normalValue = normalValue();

        }

        if (typeof flipValue === 'function') {

            flipValue = flipValue();

        }

        return this.config.flipTable ? flipValue : normalValue;

    }

    /**
     * Correct new lines
     */
    private textNoBreak(txt: string = '', pattern: '\r\n' | '\r' | '\n' = '\r\n'): string[] {

        let newTxt: string[] = [];
        let breaks: ('\r\n' | '\r' | '\n')[] = ['\r\n', '\r', '\n'];
        let patternIdx: number = breaks.indexOf(pattern);

        let st: string[] = !txt.split(pattern).length ? [txt] : txt.split(pattern);

        st.forEach(i => {

            if (typeof breaks[patternIdx + 1] !== 'undefined') {
                newTxt = newTxt.concat(this.textNoBreak(i, breaks[patternIdx + 1]));
            } else {
                newTxt = newTxt.concat(i);
            }

        });

        return newTxt;

    };

    splitText(text: any = '', columnIndex: number, rowIndex: number): string[] {

        let {removeAnsi, getAnsi, hasAnsi} = require('./ansi');

        let boomText: string[] = [];
        let mainIndex: number = this.isNormal(columnIndex, rowIndex);
        let width: number = this.columnStatus[columnIndex][1];
        let col: string = this.config.tableColumns.header[mainIndex];
        let wordWrap: boolean = this.config.header[col].wordWrap;
        let paddingLeft: number = +this.config.header[col].paddingLeft;
        let paddingRight: number = +this.config.header[col].paddingRight;

        let maxWidth: number = width;

        maxWidth = maxWidth - paddingLeft - paddingRight;

        if (typeof text !== 'object') {

            text = [text];

        }

        let readNewLines: string[] = [];
        text.forEach((txt: string) => {

            let pattern: RegExp = new RegExp('\r|\r\n|\n', 'g');

            if (pattern.test(txt)) {

                this.textNoBreak(txt).forEach(i => readNewLines = readNewLines.concat(i));

            } else {

                readNewLines = readNewLines.concat(txt);

            }

        });

        text = readNewLines;

        readNewLines = null;

        text.forEach((text: any) => {

            text = text.trim();

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

            let splitParts: number = !maxWidth ? 0 : Math.ceil(cleanText.length / maxWidth);

            if (wordWrap) {

                let wordBreak: string[] = cleanText.split(' ');
                let stack: string[] = [];
                let wordStack: string[] = [];

                /**
                 * Split long words
                 */
                wordBreak.forEach(word => {

                    if (word.length > maxWidth) {

                        if (maxWidth <= 0) {
                            wordStack.push(word);
                        } else {

                            let wordSplit: number = !maxWidth ? 0 : Math.ceil(word.length / maxWidth);
                            for (let i = 0; i < wordSplit; i++) {

                                wordStack.push(word.substr(i * maxWidth, maxWidth));

                            }

                        }

                    } else {

                        wordStack.push(word);

                    }

                });

                wordStack.map(i => i.trim()).forEach((word, idx) => {

                    let nextWordLen: number = typeof wordStack[idx + 1] === 'undefined' ? 0 : wordStack[idx + 1].length + 1;

                    stack.push(word);

                    if ((stack.join(' ').length + nextWordLen) > maxWidth) {

                        boomText = boomText.concat(nbsp(paddingLeft) + openAnsi + this.space(stack.join(' ').trim(), maxWidth, 'right') + closeAnsi + nbsp(paddingRight));

                        stack = [];

                    } else {

                        if (idx === wordStack.length - 1) {

                            boomText = boomText.concat(nbsp(paddingLeft) + openAnsi + this.space(stack.join(' ').trim(), maxWidth, 'right') + closeAnsi + nbsp(paddingRight));

                        }

                    }

                })


            } else {

                for (let i = 0; i < splitParts; i++) {

                    boomText = boomText.concat(nbsp(paddingLeft) + openAnsi + this.space(cleanText.substr(i * maxWidth, maxWidth).trim(), maxWidth, 'right') + closeAnsi + nbsp(paddingRight));

                }

            }


        });

        return boomText;

    };

    private detectMaxWidth(row: any[] = [], totalColumns: number = 0, maxWidth: number = 0, columnsInfo: any = [], props: any = {}) {

        let {removeAnsi} = require('./ansi');
        let {forceString} = require('./utils');

        let removeThisLength: number = 0;

        if (props.hasOwnProperty('paddingLeft')) {
            removeThisLength = removeThisLength + props.paddingLeft;
        }
        if (props.hasOwnProperty('paddingRight')) {
            removeThisLength = removeThisLength + props.paddingRight;
        }

        let col: any[] = [];

        let maxCellWidth: number = 0;

        row.forEach((i: any) => {

            if ([null, undefined].indexOf(i) === -1) {

                if (typeof i === "object") {

                    if (typeof i.length !== 'undefined') {

                        i.forEach((z: string) => {
                            z = removeAnsi(z.trim());
                            if (z.length > maxCellWidth) {
                                maxCellWidth = z.length;
                            }
                            col.push(removeAnsi(forceString(z)));
                        })

                    } else {

                        col.push(removeAnsi(forceString(typeof i)));

                    }

                } else {

                    i = removeAnsi(i.trim());

                    if (i.length > maxCellWidth) {
                        maxCellWidth = i.length;
                    }

                    col.push(removeAnsi(forceString(i)));

                }

            }

        });

        let autoWidth: number = Math.floor(maxWidth / totalColumns);
        let columnAnalysis: number = this.readColumn(row) + removeThisLength;

        if (columnAnalysis > this.config.terminalWidth) {

            columnAnalysis = this.config.terminalWidth - totalColumns * 2 - 1;

        }

        if (columnAnalysis >= this.config.terminalWidth) {
            columnAnalysis = removeThisLength + autoWidth;
        }

        let avg: number = 0;

        if (col.length) {

            avg = (col.map(i => i.length).reduce((a, b) => a + b) / col.length) + removeThisLength;

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

    }

    private keepColumnsThatFit() {

        let keepCols: number[][] = [];
        let tempTerminalWidth: number = this.config.terminalWidth;


        if (this.config.flipTable) {

            this.columnStatus.forEach((col: number[]) => {

                let [, width] = col;

                if (tempTerminalWidth - width > 0) {
                    tempTerminalWidth = tempTerminalWidth - width;
                    keepCols.push(col);
                } else {

                    this.data = this.data.map(r => {

                        r[1] = r[1].filter((v, i) => i < keepCols.length);

                        return r;

                    })

                }

            });

            this.columnStatus = keepCols;

        }


    }

    private space(text: string, maxCellWidth: number = 0, textAlign: "left" | "center" | "right" = "right", delimiter: string = ' '): string {

        let newText: string = text;

        if (maxCellWidth) {

            let spaceDelimiter: string = delimiter;
            let spacesLeft: string = '';
            let spacesRight: string = '';

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

    }

    /**
     * Detect columns width
     * @returns {(string | number)[][]}
     */
    private getColumnsStatus(): any {

        this.colrec = this.colrec + 1;

        if (!this.data.length) {
            return [];
        }

        /**
         * Search for columns with "auto"
         */
        let autoColumns: string[] = [];
        let fixedSize: number = 0;
        let columnFloored: boolean = false;
        let foundColumnWidth: [string, number | string][] = [];
        let originalMaxColumns: number = this.data[0][1].length;
        let maxColumns: number = originalMaxColumns;
        let diffDelimiters: number = maxColumns + 1;
        let flipTable: boolean = this.config.flipTable;
        let columnIndex: string[][] = [];


        /**
         * Remove hidden columns
         */
        const removeHiddenColumns = () => {

            this.config.tableColumns.header.forEach((item: string, index: number) => {

                if (this.config.header[item].show === false) {

                    if (this.config.flipTable) {

                        this.data = this.data.filter((itm, idx) => {

                            return itm[0] !== index;

                        });

                        /**
                         * Reindex rows
                         * @type {[number , string[]][]}
                         */
                        this.data = this.data.map((itm, idx) => {

                            itm[0] = idx;

                            return itm;

                        });

                    } else {

                        this.data = this.data.map((itm) => {

                            itm[1] = itm[1].filter((itm2, idx2) => {

                                return idx2 !== index;

                            });

                            return itm;

                        });

                    }

                    delete this.config.header[item];
                    this.config.tableColumns.header = this.config.tableColumns.header.filter((i: string) => i !== item);

                }

            });

            /**
             * Update variables
             */
            if (!this.config.flipTable) {

                maxColumns = this.config.tableColumns.header.length;
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
        let zeroWidth: boolean = false;

        if (flipTable) {

            autoColumns = new Array(this.data.length + 1);

        } else {

            this.config.tableColumns.header.forEach((item: string) => {

                if (this.config.header[item].width === 'auto') {

                    autoColumns.push(item);
                    foundColumnWidth.push([item, 'auto']);

                } else {

                    let percentageConst: number = +this.config.header[item].width;

                    if (typeof this.config.header[item].width === 'string' && (/^[0-9\.]+%$/).test(this.config.header[item].width)) {
                        let nrProc: number = +this.config.header[item].width.replace(/[^0-9\.]/g, '');
                        percentageConst = !Math.floor(nrProc) ? 0 : (nrProc / 100) * this.config.terminalWidth;
                    }

                    if (!Math.floor(percentageConst)) {

                        this.config.header[item].width = 'auto';
                        this.config.header[item].show = false;

                        zeroWidth = true;

                    } else {

                        let roundedValue: number = Math.floor(percentageConst);

                        if (!isNaN(roundedValue)) {

                            if (roundedValue !== percentageConst) {

                                if (columnFloored) {
                                    roundedValue = Math.ceil(percentageConst);
                                    columnFloored = false;
                                } else {
                                    columnFloored = true;
                                }

                            }

                            /**
                             * Set for removal columns with padding bigger than length
                             * Remove -1px (border)
                             */
                            if (Math.floor(roundedValue - 1) <= (+this.config.header[item].paddingRight + +this.config.header[item].paddingLeft)) {
                                this.config.header[item].width = 'auto';
                                this.config.header[item].show = false;
                                zeroWidth = true;
                            }

                            fixedSize = fixedSize + roundedValue;

                            foundColumnWidth.push([item, roundedValue]);

                        } else {

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

        let remainingWidth: number = this.config.terminalWidth - fixedSize - diffDelimiters;

        const {removeAnsi} = require('./ansi');
        const {forceString} = require('./utils');

        const getColumnDimensions = (col: string[], colIndex: number, width: string = "auto"): (string | number)[] => {

            return [colIndex, width.toString()];

        };

        let columnsInfo: (string | number)[][] = [];

        for (let i = 0; i < originalMaxColumns; i++) {

            let gvc = this.getVisualColumn(i);

            columnIndex.push(gvc);

            columnsInfo.push(getColumnDimensions(columnIndex[columnIndex.length - 1], i, flipTable ? "auto" : foundColumnWidth[i][1].toString()));

        }

        /**
         * Add Padding
         */
        let maxPaddingLeft: number = this.config.globalOptions.paddingLeft;
        let maxPaddingRight: number = this.config.globalOptions.paddingRight;

        this.config.tableColumns.header.forEach((item: string) => {

            if (this.config.header[item].paddingLeft > maxPaddingLeft) {
                maxPaddingLeft = this.config.header[item].paddingLeft;
            }
            if (this.config.header[item].paddingRight > maxPaddingRight) {
                maxPaddingRight = this.config.header[item].paddingRight;
            }

        });

        columnsInfo = columnsInfo.map((item: any, idx) => {

            if (flipTable) {
                item.push(maxPaddingLeft);
                item.push(maxPaddingRight);
            } else {

                item.push(this.config.header[this.config.tableColumns.header[idx]].paddingLeft);
                item.push(this.config.header[this.config.tableColumns.header[idx]].paddingRight);

            }

            return item;

        });


        let auto: number[][] = (columnsInfo as number[][]).filter((i: any) => i[1] === 'auto');

        /**
         * Remove borders from columns Width
         */
        columnsInfo = columnsInfo.map((item: any, idx) => {

            if (item[1] !== 'auto') {

                item[1] = +item[1] - (idx === 0 ? 2 : 1);

            }

            return item;

        });

        let recursiveNr: number = 0;

        /**
         * Reassign width to fit more columns
         */
        const canWeFit = (width: number = 0): boolean => {

            if (width > 0) {

                let spaceRetrieved: [number, number][] = [];

                let ids: number[] = auto.map(a => +a[0]);

                columnIndex.forEach((i, idx) => {

                    if (ids.indexOf(idx) !== -1) {

                        let maxLen: number = i.map(l => (l.length > columnsInfo[idx][1] ? +columnsInfo[idx][1] : l.length) + +columnsInfo[idx][2] + +columnsInfo[idx][3]).sort((a, b) => +a + +b)[0];

                        if (maxLen > 0 && maxLen < +columnsInfo[idx][1]) {

                            spaceRetrieved.push([idx, +columnsInfo[idx][1] - maxLen])

                        }

                    }

                });

                if (spaceRetrieved.length) {

                    /**
                     * Sort desc by the number of free cells
                     */
                    spaceRetrieved = spaceRetrieved.sort((a: any, b: any): any => {

                        return a[1] < b[1];

                    });

                    let totalFreeCells: number = spaceRetrieved.map(i => i[1]).reduce((a, b) => a + b);

                    if (totalFreeCells >= width) {

                        let [colIdx] = spaceRetrieved[0];

                        columnsInfo[colIdx][1] = +columnsInfo[colIdx][1] - 1;

                        return canWeFit(width - 1);

                    }


                }

            }

            return false;

        };

        const fixLargeColumns = (): any => {

            let ids: number[] = auto.map(a => +a[0]);

            let columnsPercentage: any = columnsInfo
                .filter(i => ids.indexOf(+i[0]) !== -1)
                .map(i => {

                    let proc: number = Math.floor(+i[1] / this.config.terminalWidth * 100);

                    if (typeof i[4] === 'undefined') {
                        i.push(proc);
                    } else {
                        i[4] = proc;
                    }

                    return i;

                }).sort((a: any, b: any): any => a[4] < b[4]);

            let largestItem: any = columnsPercentage[0];
            let averageItems: any = columnsPercentage.filter((i: any, x: number) => x > 0);

            if (averageItems.length) {

                averageItems = Math.floor(averageItems.map((i: any) => i[1]).reduce((a: any, b: any) => a + b) / averageItems.length);

            } else {

                averageItems = 1;

            }

            if (largestItem[1] > averageItems * 2.5 && columnsInfo.length > 1) {

                columnsPercentage[0][1] = averageItems + Math.ceil(averageItems * 0.15);

                columnsInfo = columnsInfo.map(item => {

                    if (item[0] === largestItem[0]) {
                        item[1] = largestItem[1];
                    }

                    return item;

                });

                return fixLargeColumns();

            }

        };


        let columnWordsAvg: any[][] = [];
        let columnsWereRemoved: boolean = false;

        const redistributeWidth = (): any => {

            recursiveNr++;

            if (auto.length && autoColumns.length) {

                let ids: number[] = auto.map(a => +a[0]);

                auto.forEach(itm => {

                    let [autoIdx] = itm;

                    if (recursiveNr === 1) columnIndex.forEach((row: string[], idx: number) => {

                        if (ids.indexOf(idx) !== -1 && autoIdx === idx) {

                            let cmw: any = this.detectMaxWidth(row, this.isNormal(+maxColumns, auto.length), remainingWidth, columnsInfo, {
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

                if (recursiveNr === 1) columnsInfo.forEach(i => canWeFit(+i[1]));

                let totalWidth: number = columnsInfo.map(i => +i[1]).reduce((a, b) => a + b) + columnsInfo.length + 1;
                remainingWidth = this.config.terminalWidth - totalWidth;

                if (totalWidth > this.config.terminalWidth && columnsInfo.length > 1) {

                    columnsWereRemoved = true;

                    if (this.config.flipTable) {

                        let lastAuto: any = auto[auto.length - 1];
                        remainingWidth = +remainingWidth + +lastAuto[1];
                        auto = auto.filter((i, idx) => idx !== auto.length - 1);
                        columnsInfo = columnsInfo.filter((i, idx) => idx !== columnsInfo.length - 1);
                        columnIndex = columnIndex.filter((i, idx) => idx !== columnIndex.length - 1);
                        columnWordsAvg = columnWordsAvg.filter((i) => +i[4] !== +lastAuto[0]);

                        this.data = this.data.map((i) => {

                            i[1] = i[1].filter((ii, xx) => xx !== i[1].length - 1);

                            return i;

                        });

                        maxColumns = +maxColumns - 1;

                        return redistributeWidth();

                    } else {

                        /**
                         * We'll remove first 'auto' columns with highest 'priority'
                         * If we don't have any 'auto' columns we'll remove the columns with highest 'priority'
                         */

                        let lastAutoCol: string = "";
                        let priority: number = 0;

                        autoColumns.forEach(col => {

                            if (typeof this.config.header[col] !== 'undefined' && this.config.header[col].priority > priority) {
                                priority = this.config.header[col].priority;
                                lastAutoCol = col;
                            }

                        });

                        let lastAutoColIdx: number = this.config.tableColumns.header.indexOf(lastAutoCol);

                        auto = auto.filter((i) => i[0] !== lastAutoColIdx);

                        autoColumns = autoColumns.filter((i) => i !== lastAutoCol);

                        columnsInfo = columnsInfo.filter((i, idx) => idx !== lastAutoColIdx).map((i, idx) => {
                            i[0] = idx;
                            return i;
                        });

                        columnIndex = columnIndex.filter((i, idx) => idx !== lastAutoColIdx);
                        columnWordsAvg = columnWordsAvg.filter((i) => +i[4] !== +lastAutoColIdx);

                        delete this.config.header[lastAutoCol];
                        this.config.tableColumns.header = this.config.tableColumns.header.filter((i: string) => i !== lastAutoCol);

                        this.data = this.data.map((i) => {

                            i[1] = i[1].filter((ii, xx) => xx !== lastAutoColIdx);

                            return i;

                        });

                        maxColumns = +maxColumns - 1;

                        return redistributeWidth();

                    }


                } else {

                    let ids: number[] = auto.map(a => +a[0]);
                    let ci: any = columnsInfo;

                    /**
                     * Cell Width > MaxColumnWidth will be reset to MaxColumnWidth
                     */
                    columnsInfo = columnsInfo.map((i, idx) => {

                        if (ids.indexOf(idx) !== -1) columnWordsAvg.forEach(ii => {

                            let colInfoIndex: number = +i[0];
                            let avgInfoIndex: number = +ii[4];

                            let curCol: number = +i[1];
                            let paddingLeft: number = +i[2];
                            let paddingRight: number = +i[3];
                            let maxColWidth: number = +ii[3] + paddingLeft + paddingRight;

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
                    let newTotal: number = columnsInfo.map(i => +i[1]).reduce((a, b) => a + b) + columnsInfo.length + 1;
                    let tablePercentage: number = Math.floor((newTotal / this.config.terminalWidth) * 100);

                    const increaseSmallestColumn = (width: number = 0): any => {

                        if (width > 0) {


                            let ciRemainingAuto: number[][] = ci.filter((x: any, xx: any) => ids.indexOf(xx) !== -1);

                            // .filter((x:any,xx:any)=> ids.indexOf(xx) !== -1)
                            let sortAsc: number[][] = ciRemainingAuto
                                .sort((a: number[], b: number[]) => +a[1] - +b[1])
                                .map((i: any) => i.map((ii: any) => +ii));

                            let smallestColumn: number[] = sortAsc[0];

                            columnsInfo.forEach((i: number[], idx: number) => {

                                if (ids.indexOf(idx) !== -1 && +i[0] === +smallestColumn[0]) {

                                    remainingWidth = remainingWidth - 1;
                                    columnsInfo[idx][1] = +columnsInfo[idx][1] + 1;

                                }

                            });

                            return increaseSmallestColumn(--width);


                        }

                        return false;

                    };

                    if (columnsWereRemoved && remainingWidth > 0 || (!this.config.flipTable && tablePercentage > 60)) {

                        increaseSmallestColumn(remainingWidth);

                    } else {

                        columnsInfo = columnsInfo.map((i, idx) => {

                            if (ids.indexOf(idx) !== -1) columnWordsAvg.forEach(ii => {

                                newTotal = columnsInfo.map(i => +i[1]).reduce((a, b) => a + b) + columnsInfo.length + 1;
                                let maxColWidth: number = +ii[3] + +i[2] + +i[3];

                                if (+i[0] === +ii[4] && remainingWidth > 0) {

                                    let maxCellWidthNoPad: number = +ii[3];
                                    let padding: number = +i[2] + +i[3];
                                    let average: number = +ii[1];
                                    let currCol: number = +i[1];

                                    if (maxCellWidthNoPad / currCol < 2) {

                                        remainingWidth = remainingWidth - maxCellWidthNoPad;
                                        i[1] = maxColWidth;

                                    } else {

                                        if ((newTotal + ii[0]) <= this.config.terminalWidth) {
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

    }

    /**
     * Get the cells from a COLUMN = works with normal and flip table
     * @param {number} columnIndex
     * @returns {string[]}
     */
    getVisualColumn(columnIndex: number): string[] {

        let stack: string[] = [];

        this.data.forEach((item: any) => {

            if (item[1].hasOwnProperty(columnIndex)) {
                stack.push(item[1][columnIndex]);
            }

        });

        return stack;

    };

}

const prepareData = (data: [number, string[]][], config: any): [[number, string[][]][], number[][], any] => {

    const ptd = new PrepareTableData(data, config);

    let formattedRows: any = [];

    for (let [rowIndex, row] of ptd.data) {

        let prepRow = ptd.prepareRow(rowIndex, row);

        formattedRows.push([rowIndex, prepRow]);

    }

    return [formattedRows, ptd.columnStatus, ptd.config];

};

/**
 * Create a space
 * @param {number} howMany
 * @returns {string}
 */
const nbsp = (howMany: number = 0) => {

    return new Array(howMany + 1).join(' ');

};
const getRealIndex = (idx: number, maxArrayLen: number): number => {

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
const tableHeader = (data: any = {}) => {

    let columns: string[] = [];

    for (let record in data) {

        if (data.hasOwnProperty(record)) {

            for (let columnName in data[record]) {

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
const correctData = (data: any): any => {

    let objectColumns: string[] = [];

    const {loop, keys} = require('./utils');

    /**
     * Get all columns
     */
    loop(data, (key: string, column: string) => {

        if (objectColumns.indexOf(column) === -1) {
            objectColumns.push(column);
        }

    });

    /**
     * Fill all records with the missing columns
     */
    loop(data, (key: string, column: string) => {

        let objKeys: string[] = keys(data[key]);

        if (objKeys.length !== objectColumns.length) {

            let fillWithColumns: string[] = objectColumns.filter(i => objKeys.indexOf(i) === -1);

            fillWithColumns.forEach(i => {

                data[key][i] = '';

            })

        }

        if (objectColumns.indexOf(column) === -1) {
            objectColumns.push(column);
        }

    });

    /**
     * Sort all records columns based on objectColumns
     */
    let sortedData: any = {};

    objectColumns.forEach(col => {

        for (let key in data) {

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
const tableMatrix = (data: any = {}, flipData: boolean = false): [number, string[]][] => {

    const {forceString} = require('./utils');

    let matrix: any = [];

    let i = 0;

    let stackFlip: any = {};

    for (let record in data) {

        if (data.hasOwnProperty(record)) {

            let stackisNormal: string[] = [];

            for (let columnName in data[record]) {

                if (data[record].hasOwnProperty(columnName)) {

                    if (flipData) {

                        if (typeof stackFlip[columnName] === 'undefined') {
                            stackFlip[columnName] = [];
                        }

                        stackFlip[columnName].push(forceString(data[record][columnName]));

                    } else {

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

        let idx = 0;
        for (let itm in stackFlip) {

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