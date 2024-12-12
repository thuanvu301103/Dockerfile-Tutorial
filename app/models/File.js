const BPlusTree = require('../models/BPlusTree');
const AVLTree = require('../models/AVLTree');
const TrieTree = require('../models/TrieTree');
const fs = require('fs');
const readline = require('readline');

function parseDate(dateTimeStr) {
    //console.log("Parsing: ", dateTimeStr);
    // Split the date and time parts
    dateTimeStr = dateTimeStr.replace(/"/g, '');
    const [datePart] = dateTimeStr.split('_');
    //console.log(datePart);
    // Parse the date part
    const [day, month, year] = datePart.split('/').map(Number);
    //console.log(day, month, year);
    // Create a new Date object
    const date = new Date(year, month - 1, day);
    //console.log("Result: ", date);
    return date;
}

class File {

    #filePath;
    #tableOffsetIndex = null;
    #columnName = [];
    #size = {};

    constructor(filePath) {
        this.#filePath = filePath;
        // Initialize offset_index using the async method
        this.#tableOffsetIndex = this.#initialize(); // This will be a promise
        //this.dateTimeTree = new BPlusTree();
        this.dateTimeTree = new AVLTree();
        //this.creditTree = new BPlusTree();
        this.creditTree = new AVLTree();
        //this.debitTree = new BPlusTree();
        this.debitTree = new AVLTree();
        this.detailTree = new TrieTree();
    }

    async #initialize() {
        // Call buildOffsetIndex and await its result
        this.#tableOffsetIndex = await this.#buildOffsetIndex();
        return this.#tableOffsetIndex; // Return the populated index
    }

    #formatString(data) {
        data = data.trim();
        if (data.startsWith('"') && data.endsWith('"')) {
            data = data.slice(1, -1);
        }
        data.replace(/""/g, '"');
        return data;
    }

    #findAllIndices(str, subStr) {
        let indices = [];
        let index = str.indexOf(subStr); // Find the first occurrence

        while (index !== -1) {
            indices.push(index); // Store the index
            index = str.indexOf(subStr, index + subStr.length - 1); // Find next occurrence starting from the next position
        }

        return indices;
    }

    /**
     * Build OffsetIndex mechanism for file
     * 
     * @param {string} delimiter
     * @returns {Promise<Array<{ lineOffset: number, columnOffsets: number[] }>>} -
     *   A promise that resolves to an array of objects, each representing a line's starting byte offset
     *   and the byte offsets for each column within that line.
     */
    async #buildOffsetIndex(delimiter = ',') {
        const index = [];
        const fileStream = fs.createReadStream(this.#filePath);
        fileStream.setEncoding('utf8'); // Set encoding to UTF-8 for string data

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let byteOffset = 0;
        let isHeader = true;
        let row = -2;
        for await (const line of rl) {
            let col = 0;
            row += 1;
            //console.log(rl.length);
            if (row == 200346) console.log("File Process Completed!");

            const cellOffsets = [];
            let inQuotes = false;
            let startByteOffset = byteOffset; // Track the starting byte offset for the line
            //console.log("Line: ", line);
            let cellContent = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                //console.log(i, '=', char, " - Byte Lenght: ", Buffer.byteLength(char), " - Cell Lenght: ", Buffer.byteLength(cellContent));
                cellContent += char;

                // Toggle the inQuotes state on encountering an unescaped quote
                //if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                    //console.log("InQoute: ", inQuotes);
                    continue;
                }

                // Check if we've hit a delimiter and we're not in quotes
                if (char === delimiter && !inQuotes) {
                    // Push the start and end offsets for the current cell
                    const endByteOffset = startByteOffset + Buffer.byteLength(cellContent) - Buffer.byteLength(delimiter) - 1;
                    //console.log("end: ", endByteOffset, " - ByteOffset: ", byteOffset, " - startByteOffset: ", startByteOffset, "- cellLenght: ", Buffer.byteLength(cellContent));
                    cellOffsets.push({ start: startByteOffset, end: endByteOffset });



                    // If isHeader then add cellContent to columnName
                    if (isHeader) this.#columnName.push(this.#formatString(cellContent.slice(0, -1)));

                    // Reset for the next cell
                    startByteOffset += Buffer.byteLength(cellContent); // Update start for next cell
                    if (!isHeader) {
                        //console.log("Data: ", cellContent);
                        if (col == 0) {
                            let key = await parseDate(cellContent);
                            //console.log("Date: ", key, row);
                            let value = row;
                            //this.dateTimeTree.insert(key, value);
                            this.dateTimeTree.insertKeyValue(key, value);
                        } else if (col == 2) {
                            let key = parseInt(cellContent.replace(/"/g, ''), 10);
                            //console.log("Credit: ", key, row);
                            let value = row;
                            this.creditTree.insertKeyValue(key, value);
                            //this.creditTree.insert(key, value);
                        } else if (col == 3) {
                            let key = parseInt(cellContent.replace(/"/g, ''), 10);
                            //console.log("Debit: ", key, row);
                            let value = row;
                            this.debitTree.insertKeyValue(key, value);
                            //this.debitTree.insert(key, value);
                        } 

                        col += 1;
                    }
                    cellContent = ''
                    //console.log("start: ", startByteOffset);
                    continue;
                }

            }

            // Handle Final cell of row
            cellOffsets.push({ start: startByteOffset, end: startByteOffset + Buffer.byteLength(cellContent, 'utf8') - 1 });
            if (isHeader) this.#columnName.push(this.#formatString(cellContent));

            // Push the index for this line with offsets for each cell
            if (!isHeader) {
                //console.log(cellContent);
                let key = cellContent;
                let value = row;
                this.detailTree.insert(key, value);
                index.push({
                    lineOffset: byteOffset, // Starting byte offset of the line
                    cellOffsets: cellOffsets // Start and end offsets for each cell in the line
                });
            }

            isHeader = false;


            // Update for the next line (+1 for newline)
            byteOffset += Buffer.byteLength(line, 'utf8') + 2;
        }
        //console.log(JSON.stringify(index, null, 2));
        this.#size.row = index.length;
        this.#size.column = this.#columnName.length;
        return index;
    }

    /**
     * Reads a specific cell from a CSV file by line and column index, using pre-built byte offsets.
     *
     * @param {number} rowNumber - The 0-based line number of the desired cell.
     * @param {number} columnNumber - The 0-based column number within the line.
     * @returns {Promise<string>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async getCell(rowNumber, columnNumber) {
        if (rowNumber < 0 || rowNumber >= this.#size.row || columnNumber < 0 || columnNumber >= this.#size.column) throw new Error("Out of Range");

        const { lineOffset, cellOffsets } = this.#tableOffsetIndex[rowNumber];

        return new Promise((resolve, reject) => {
            let data = '';

            // Create a readable stream starting from the byte offset of the specified line
            const fileStream = fs.createReadStream(this.#filePath, { start: cellOffsets[columnNumber].start, end: cellOffsets[columnNumber].end });

            fileStream.setEncoding('utf8'); // Set encoding to UTF-8 for string data

            // Collect data chunks
            fileStream.on('data', (chunk) => {
                data += chunk;
            });

            // Resolve the promise with the collected string when the stream ends
            fileStream.on('end', () => {
                // Format string in CSV to normal string
                data = this.#formatString(data);

                resolve(data); // Return the accumulated string
            });

            // Handle any errors
            fileStream.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Search for a substring in cell
     *
     * @param {string} substring The substring that need to be search in cell.
     * @param {number} rowNumber - The 0-based line number of the desired cell.
     * @param {number} columnNumber - The 0-based column number within the line.
     * @returns {Promise<Array<number>>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async searchMatchInCell(substring, rowNumber, columnNumber) {
        if (rowNumber < 0 || rowNumber >= this.#size.row || columnNumber < 0 || columnNumber >= this.#size.column) throw new Error("Out of Range");

        const { lineOffset, cellOffsets } = this.#tableOffsetIndex[rowNumber];

        return new Promise((resolve, reject) => {
            const chunks = [];

            // Create a readable stream starting from the byte offset of the specified line
            const fileStream = fs.createReadStream(this.#filePath, { start: cellOffsets[columnNumber].start, end: cellOffsets[columnNumber].end });

            // Collect data chunks
            fileStream.on('data', (chunk) => {
                chunks.push(chunk); // Buffer chunks are stored incrementally
            });

            // Resolve the promise with the collected string when the stream ends
            fileStream.on('end', () => {
                const data = Buffer.concat(chunks);
                if (data.toString('utf-8').indexOf(substring) === -1) resolve(false);
                resolve(true); // Return the accumulated string
            });

            // Handle any errors
            fileStream.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Search for a substring in cell
     *
     * @param {string} substring The substring that need to be search in cell.
     * @param {number} rowNumber - The 0-based line number of the desired cell.
     * @param {number} columnNumber - The 0-based column number within the line.
     * @returns {Promise<Array<number>>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async searchInCell(substring, rowNumber, columnNumber) {
        if (rowNumber < 0 || rowNumber >= this.#size.row || columnNumber < 0 || columnNumber >= this.#size.column) throw new Error("Out of Range");

        const { lineOffset, cellOffsets } = this.#tableOffsetIndex[rowNumber];

        return new Promise((resolve, reject) => {
            let data = '';

            // Create a readable stream starting from the byte offset of the specified line
            const fileStream = fs.createReadStream(this.#filePath, { start: cellOffsets[columnNumber].start, end: cellOffsets[columnNumber].end });

            fileStream.setEncoding('utf8'); // Set encoding to UTF-8 for string data

            // Collect data chunks
            fileStream.on('data', (chunk) => {
                data += chunk;
            });

            // Resolve the promise with the collected string when the stream ends
            fileStream.on('end', () => {
                // Format string in CSV to normal string
                data = this.#formatString(data);
                resolve(this.#findAllIndices(data, substring)); // Return the accumulated string
            });

            // Handle any errors
            fileStream.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Reads a specific row from a CSV file by line and column index, using pre-built byte offsets.
     *
     * @param {string} substring The substring that need to be search in cell.
     * @param {number} rowNumber - The 0-based line number of the desired cell.
     * @returns {Promise<any>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async searchInRow(substring, rowNumber) {
        if (rowNumber < 0 || rowNumber >= this.#size.row) throw new Error("Out of Range");
        // Retrieve the offsets for the specified line
        //console.log("Search In Row is running");
        return new Promise(async (resolve, reject) => {
            let data = {};
            //console.log("Data", data, " - Row length: ", this.table[rowNumber].cellOffsets.length);
            for (let i in this.#tableOffsetIndex[rowNumber].cellOffsets) {
                //console.log(i , "=");
                this.searchInCell(substring, rowNumber, i)
                    .then((content) => {
                        //console.log(content);
                        if (content.length != 0) data[i] = content;

                    }).catch((error) => {
                        reject(error);
                    });
            }

            resolve(data); // Return the accumulated string

        });
    }

    /**
     * Search for a substr in a Row at Column
     *
     * @param {string} substring The substring that need to be search in cell.
     * @param {number} rowNumber - The 0-based line number of the desired cell.
     * @returns {Promise<any>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async searchInRowAtColumn(substring, rowNumber, columnId) {
        if (rowNumber < 0 || rowNumber >= this.#size.row) throw new Error("Out of Range");
        // Retrieve the offsets for the specified line
        //console.log("Search In Row is running");
        return new Promise(async (resolve, reject) => {
            let data = {};
            //console.log("Data", data, " - Row length: ", this.table[rowNumber].cellOffsets.length);
            await this.searchInCell(substring, rowNumber, columnId)
                .then((content) => {
                    //console.log(content);
                    if (content.length != 0) data[columnId] = content;

                }).catch((error) => {
                    reject(error);
                });

            resolve(data); // Return the accumulated string

        });
    }

    /**
     * Search for substring Row
     *
     * @param {number} rowNumber - The 0-based line number of the desired cell.
     * @returns {Promise<string>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async getRow(rowNumber) {
        if (rowNumber < 0 || rowNumber >= this.#size.row) throw new Error("Out of Range");
        // Retrieve the offsets for the specified line
        return new Promise(async (resolve, reject) => {
            let data = [];
            //console.log("Data", data, " - Row length: ", this.table[rowNumber].cellOffsets.length);
            for (let i in this.#tableOffsetIndex[rowNumber].cellOffsets) {
                //console.log(i , "=");
                await this.getCell(rowNumber, i)
                    .then((content) => {
                        //console.log(content);
                        data.push(content);
                    }).catch((error) => {
                        reject(error);
                    });
            }

            resolve(data); // Return the accumulated string

        });
    }

    /**
     * Reads a specific rows by Range from a CSV file by line and column index, using pre-built byte offsets.
     *
     * @param {number} rowNumberArr - The 0-based line number of the desired cell.
     * @returns {Promise<string>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async getRowsRange(fromId, toId) {
        if (fromId > toId) throw new Error("Invalid range");
        if (fromId < 0 || fromId >= this.#size.row || toId < 0 || toId >= this.#size.row) throw new Error("Out of Range");
        return new Promise(async (resolve, reject) => {
            let data = [];
            for (let i = fromId; i <= toId; i++) {
                await this.getRow(i)
                    .then((content) => {
                        data.push(content);
                    }).catch((error) => {
                        reject(error);
                    });
            }

            resolve(data); // Return the accumulated string

        });
    }

    async getRows(rowIds) {
        return new Promise(async (resolve, reject) => {
            let data = [];
            for (const i of rowIds) {
                await this.getRow(i)
                    .then((content) => {

                        data.push(content);
                    }).catch((error) => {
                        reject(error);
                    });
            }
            //console.log(data);
            resolve(data); // Return the accumulated string

        });
    }

    /**
     * search In RowRange
     *
     * @param {number} rowNumberArr - The 0-based line number of the desired cell.
     * @returns {Promise<string>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async searchInRowsRange(search, fromId, toId) {
        if (fromId > toId) throw new Error("Invalid range");
        if (fromId < 0 || fromId >= this.#size.row || toId < 0 || toId >= this.#size.row) throw new Error("Out of Range");
        //console.log("Search In Row Range is running");
        return new Promise(async (resolve, reject) => {
            let data = {};
            for (let i = fromId; i <= toId; i++) {
                await this.searchInRow(search, i)
                    .then((content) => {
                        //console.log("Search Res: ", content);
                        if (JSON.stringify(content) != '{}') data[i] = content;
                    }).catch((error) => {
                        reject(error);
                    });
            }

            resolve(data); // Return the accumulated string

        });
    }

    /**
     * search In RowRange At Column
     *
     * @param {number} rowNumberArr - The 0-based line number of the desired cell.
     * @returns {Promise<string>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async searchInRowsRangeAtColumn(search, fromId, toId, columnId) {
        if (fromId > toId) throw new Error("Invalid range");
        if (fromId < 0 || fromId >= this.#size.row || toId < 0 || toId >= this.#size.row) throw new Error("Out of Range");
        //console.log("Search In Row Range is running");
        return new Promise(async (resolve, reject) => {
            let data = {};
            for (let i = fromId; i <= toId; i++) {
                this.searchInCell(search, i, columnId)
                    .then((content) => {
                        //console.log("Search Res: ", content);
                        if (content.length != 0) data[i] = content;
                    }).catch((error) => {
                        reject(error);
                    });
            }

            resolve(data); // Return the accumulated string

        });
    }

    /**
     * search In RowRange At Column
     *
     * @param {number} rowNumberArr - The 0-based line number of the desired cell.
     * @returns {Promise<string>} - A promise that resolves to the content of the specified cell, trimmed of whitespace.
     */
    async searchMatchInRowsRangeAtColumn(search, fromId, toId, columnId) {
        if (fromId > toId) throw new Error("Invalid range");
        if (fromId < 0 || fromId >= this.#size.row || toId < 0 || toId >= this.#size.row) throw new Error("Out of Range");
        //console.log("Search In Row Range is running");
        return new Promise(async (resolve, reject) => {
            const { default: pLimit } = await import('p-limit');  // Dynamically import p-limit
            const limit = pLimit(10);  // Set the maximum concurrent promises

            // Now, you can safely use limit
            const promises = [];
            const data = [];

            for (let i = fromId; i <= toId; i++) {
                // Limit the number of concurrent executions
                const promise = limit(() => this.searchMatchInCell(search, i, columnId)
                    .then((match) => {
                        if (match) data.push(i);
                    })
                );
                promises.push(promise);
            }

            // Wait for all promises to complete
            Promise.all(promises)
                .then(() => resolve(data))
                .catch((error) => reject(error));

        });
    }

    /**
     * Get file direactory
     * 
     * @returns {string} file directory
     */
    getFileDir() {
        return this.#filePath;
    }

    /**
     * Get column names
     * 
     * @returns {Array<string>} array of column's name
     */
    getColumnName() {
        return this.#columnName;
    }

    searchCredit(credit) {
        //console.log(credit);
        //return this.creditTree.search(credit);
        return this.creditTree.searchKey(credit);
    }

    rangeSearchCredit(startCredit, endCredit) {
        //return this.creditTree.rangeSearch(startCredit, endCredit);
        return this.creditTree.rangeSearchKeys(startCredit, endCredit);
    }

    searchDebit(debit) {
        //console.log(credit);
        //return this.debitTree.search(debit);
        return this.debitTree.searchKey(debit);
    }

    rangeSearchDebit(startDebit, endDebit) {
        //return this.creditTree.rangeSearch(startDebit, endDebit);
        return this.debitTree.rangeSearchKeys(startDebit, endDebit);
    }

    searchTime(time) {
        //return this.dateTimeTree.search(time);
        return this.dateTimeTree.searchKey(time)
    }

    rangeSearchTime(startTime, endTime) {
        //return this.dateTimeTree.rangeSearch(startTime, endTime);
        return this.dateTimeTree.rangeSearchKeys(startTime, endTime);
    }

    searchDetail(detail) {
        //console.log("Search by Detail: ", detail);
        return this.detailTree.search(detail);
    }
}

module.exports = File;
