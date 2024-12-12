const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');

// Routes
router.get('/dataFolderDir', databaseController.getDataFolderDir);
router.get('/allFile', databaseController.getAllFileName);

module.exports = router;