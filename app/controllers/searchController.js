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

function intersection(arrays) {
    if (arrays.length === 0) return [];
    return arrays.reduce((acc, array) => acc.filter(value => array.includes(value)));
}


// Search for Data
exports.search = async (req, res) => {
    const {
        // Date data
        fromDate, toDate, dateSearch,
        // Credit data
        fromCredit, toCredit, creditSearch,
        // Debit data
        fromDebit, toDebit, debitSearch,
        // Detail data
        detailSearch,
        // Limit
        limit,
    } = req.query;
    let file = Database.getFile(0);
    if (file) {
        var input_arrs = [];
        // Filter process
        var idsByFilteredDate = [];
        var idsByFilteredCredit = [];
        var idsByFilteredDebit = [];

        if (fromDate || toDate) {
            idsByFilteredDate = await file.rangeSearchTime(parseDate(fromDate), parseDate(toDate));
            //console.log("Ids Filter by Time: ", idsByFilteredDate);
            input_arrs.push(idsByFilteredDate);
        }
        if (fromCredit || toCredit) {
            idsByFilteredCredit = await file.rangeSearchCredit(parseInt(fromCredit, 10), parseInt(toCredit, 10));
            //console.log("Ids Filter by Time: ", idsByFilteredDate);
            input_arrs.push(idsByFilteredCredit);
        }
        if (fromDebit || toDebit) {
            idsByFilteredDebit = await file.rangeSearchDebit(parseInt(fromDebit, 10), parseInt(toDebit, 10));
            //console.log("Ids Filter by Time: ", idsByFilteredDate);
            input_arrs.push(idsByFilteredDebit);
        }
        var idsByTime = [];
        var idsByCredit = [];
        var idsByDebit = [];
        var idsByDetail = [];
        var ids = [];
        var resData = [];
        // Start Searching - Get Ids
        if (dateSearch) {
            //console.log("Search by Date: ", dateSearch);
            idsByTime = await file.searchTime(parseDate(dateSearch));
            //console.log("Ids by Time: ", idsByTime);
            input_arrs.push(idsByTime);
        }
        if (creditSearch) {
            idsByCredit = await file.searchCredit(parseInt(creditSearch,10));
            //console.log("Ids by Credit: ", idsByCredit);
            input_arrs.push(idsByCredit);
        }
        if (debitSearch) {
            idsByDebit = await file.searchDebit(parseInt(debitSearch, 10));
            //console.log("Ids by Credit: ", idsByCredit);
            input_arrs.push(idsByDebit);
        }
        if (detailSearch) {
            idsByDetail = await file.searchDetail(detailSearch);
            //console.log("Ids by Detail: ", idsByDetail);
            input_arrs.push(idsByDetail);
        }

        // Union of all ids list
        var ids = intersection(input_arrs);
        //console.log(ids);

        if (ids.length != 0) resData = await file.getRows(ids.slice(0, limit));
        //console.log(resData);
        res.status(200).json({
            ids: ids,
            data: resData
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

// Search for Data
exports.get = async (req, res) => {
    const {
        ids
    } = req.query;
    let file = Database.getFile(0);
    if (file) {
        if (ids.length != 0) resData = await file.getRows(ids.split(','));
        //console.log(resData);
        res.status(200).json({
            data: resData
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