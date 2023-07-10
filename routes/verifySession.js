const express = require('express');
const router = express.Router();

const verifySession = require('../controller/verifySessionController');

router.post('/', verifySession);

module.exports = router;