const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Routes
router.get('/', searchController.search);
router.get('/get', searchController.get)

module.exports = router;