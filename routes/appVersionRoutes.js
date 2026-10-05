const express = require('express');

const router = express.Router();

const appVersion = require('../config/appVersion');

router.get('/', (req, res) => {
    res.json({
        success: true,
        android: appVersion.android,
    });
});

module.exports = router;