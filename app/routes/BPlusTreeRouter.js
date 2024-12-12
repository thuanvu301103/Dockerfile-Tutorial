const express = require('express');
const router = express.Router();
const BPlusTreeController = require('../controllers/BPlusTreeController');

// Routes
router.get('/insert', BPlusTreeController.insert);
router.get('/search', BPlusTreeController.search);

module.exports = router;