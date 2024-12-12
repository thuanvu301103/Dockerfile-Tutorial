const express = require('express');
const router = express.Router();
const filesController = require('../controllers/filesController');

// Routes
router.get('/fileDir', filesController.getFileDir);
router.get('/:fileId/search', filesController.search);
router.get('/:fileId/cell', filesController.getCell);
router.get('/:fileId/cell/search', filesController.searchInCell);
router.get('/:fileId/row/:rowId', filesController.getRow);
router.get('/:fileId/row/:rowId/search', filesController.searchInRow);
router.get('/:fileId/row', filesController.getRowsRange);
router.get('/:fileId/rowRange/search', filesController.searchInRowsRange);
router.get('/:fileId/rowRangeAtColumn/search', filesController.searchInRowsRangeAtColumn);
router.get('/:fileId/columnName', filesController.getColumnName);

module.exports = router;