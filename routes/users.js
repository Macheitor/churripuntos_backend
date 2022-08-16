const express = require('express');
const router = express.Router();

const {authJWT} = require('../middlewares/auth');

const usersController = require('../controller/usersController');

router.get( '/',
            authJWT,
            usersController.getUsers);

module.exports = router;