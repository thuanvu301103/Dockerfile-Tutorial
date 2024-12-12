const Database = require('../config/db');

// Get Data Folder Directory
exports.getDataFolderDir = async (req, res) => {
    res.status(200).json({
        dataFolderDir: Database.getDataFolderDir()
    });
};

// Get all file name in database
exports.getAllFileName = async (req, res) => {
    res.status(200).json({
        fileNames: Database.getAllFileName()
    });
};