const express = require('express');
const controller = require('../controllers/mainController');
const router = express.Router();


router.get('/', controller.trades);

module.exports = router;