const express = require('express');
const router = express.Router();

const {authentication} = require('../middlewares/auth');
const login = require('../controller/loginController');

router.route( '/')
    .post(authentication, login);

module.exports = router;