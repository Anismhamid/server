const express = require('express');
const { aiSearch } = require('../controllers/aiController');

const router = express.Router();

router.post('/search', aiSearch);

module.exports = router;