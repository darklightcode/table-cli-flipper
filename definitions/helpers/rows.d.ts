declare class PrepareTableData {
    data: [number, string[]][];
    config: any;
    columnStatus: any;
    colrec: number;
    constructor(data: [number, string[]][], config?: any);
    readColumn(texts: any[]): number;
    prepareRow(columnIndex: number, row?: string[]): string[][];
    private isNormal;
    /**
     * Correct new lines
     */
    private textNoBreak;
    splitText(text: any, columnIndex: number, rowIndex: number): string[];
    private detectMaxWidth;
    private keepColumnsThatFit;
    private space;
    /**
     * Detect columns width
     * @returns {(string | number)[][]}
     */
    private getColumnsStatus;
    /**
     * Get the cells from a COLUMN = works with normal and flip table
     * @param {number} columnIndex
     * @returns {string[]}
     */
    getVisualColumn(columnIndex: number): string[];
}
declare const prepareData: (data: [number, string[]][], config: any) => [[number, string[][]][], number[][], any];
/**
 * Create a space
 * @param {number} howMany
 * @returns {string}
 */
declare const nbsp: (howMany?: number) => string;
declare const getRealIndex: (idx: number, maxArrayLen: number) => number;
/**
 * Format header
 * @param data
 * @returns {string[]}
 */
declare const tableHeader: (data?: any) => string[];
/**
 * Add missing columns if data is incomplete
 * @param data
 * @returns {any}
 */
declare const correctData: (data: any) => any;
/**
 * Format data
 * @param data
 * @param {boolean} flipData
 * @returns {[number , string[]][]}
 */
declare const tableMatrix: (data?: any, flipData?: boolean) => [number, string[]][];
