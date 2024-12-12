const Database = require('../config/db');

function parseDate(dateTimeStr) {
    // Split the date and time parts
    const [datePart] = dateTimeStr.split('_');

    // Parse the date part
    const [day, month, year] = datePart.split('/').map(Number);

    // Create a new Date object
    const date = new Date(year, month - 1, day);

    return date;
}

// Get file's directory
exports.getFileDir = async (req, res) => {
    const { fileId } = req.query;
    let file = Database.getFile(fileId);
    if (file) {
        res.status(200).json({
            fileDir: file.getFileDir()
        });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Get cell
exports.getCell = async (req, res) => {
    const fileId = req.params.fileId;
    const { rowId, columnId } = req.query;
    let file = Database.getFile(fileId);
    if (file) {
        file.getCell(rowId, columnId)
            .then((data) => {
                res.status(200).json({
                    cellData: data
                });
            }).catch((error) => {
                console.error('Error reading file:', error);
                res.status(500).send('Server Error');
            });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Search in cell
exports.searchInCell = async (req, res) => {
    const fileId = req.params.fileId;
    const { search, rowId, columnId } = req.query;
    let file = Database.getFile(fileId);
    if (file) {
        file.searchInCell(search, rowId, columnId)
            .then((data) => {
                res.status(200).json({
                    searchResultId: data
                });
            }).catch((error) => {
                console.error('Error reading file:', error);
                res.status(500).send('Server Error');
            });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Get Row
exports.getRow = async (req, res) => {
    const { fileId, rowId } = req.params;
    let file = Database.getFile(fileId);
    if (file) {
        file.getRow(rowId)
            .then((data) => {
                res.status(200).json({
                    rowData: data
                });
            }).catch((error) => {
                console.error('Error reading file:', error);
                res.status(500).send('Server Error');
            });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Search in Row
exports.searchInRow = async (req, res) => {
    const { search } = req.query;
    const { fileId, rowId } = req.params;
    //console.log("Search: ", search);
    let file = Database.getFile(fileId);
    if (file) {
        file.searchInRow(search,rowId)
            .then((data) => {
                res.status(200).json({
                    searchResultId: data
                });
            }).catch((error) => {
                console.error('Error reading file:', error);
                res.status(500).send('Server Error');
            });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Get Rows Range
exports.getRowsRange = async (req, res) => {
    const { fileId } = req.params;
    const { from, to } = req.query;
    let file = Database.getFile(fileId);
    if (file) {
        file.getRowsRange(from, to)
            .then((data) => {
                res.status(200).json({
                    rowsData: data
                });
            }).catch((error) => {
                console.error('Error reading file:', error);
                res.status(500).send('Server Error');
            });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Search In Rows Range
exports.searchInRowsRange = async (req, res) => {
    const { fileId } = req.params;
    const { search, from, to } = req.query;
    let file = Database.getFile(fileId);
    if (file) {
        file.searchInRowsRange(search, from, to)
            .then((data) => {
                res.status(200).json({
                    searchResultId: data
                });
            }).catch((error) => {
                console.error('Error reading file:', error);
                res.status(500).send('Server Error');
            });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Search In Rows Range
exports.searchInRowsRangeAtColumn = async (req, res) => {
    const { fileId } = req.params;
    const { search, from, to , columnId} = req.query;
    let file = Database.getFile(fileId);
    if (file) {
        file.searchMatchInRowsRangeAtColumn(search, from, to, columnId)
            .then((data) => {
                res.status(200).json({
                    searchResultId: data
                });
            }).catch((error) => {
                console.error('Error reading file:', error);
                res.status(500).send('Server Error');
            });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Display all users
exports.getColumnName = async (req, res) => {
    const { fileId } = req.params;
    let file = Database.getFile(fileId);
    if (file) {
        res.status(200).json({
            columnName: file.getColumnName()
        });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};

// Search
exports.search = async (req, res) => {
    const { fileId } = req.params;
    const { credit, time } = req.query;
    let file = Database.getFile(fileId);
    let row_credit_Ids = await file.searchCredit(parseInt(credit, 10));
    let row_time_Ids = await file.searchTime(parseDate(time));
    if (file) {
        res.status(200).json({
            row_data: await file.getRows(row_time_Ids)
        });
    }
    else {
        console.error('Error reading file: Out of range');
        res.status(400).json({
            success: false,
            message: "Resource not found"
        })
    }
};