const express = require('express');
const router = express.Router();
const { getAllReadings, createReading } = require('../controllers/readingcontrollers');

router.route('/').get(getAllReadings).post(createReading);

module.exports = router;
