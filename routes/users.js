const express = require('express');
const router = express.Router();

const {authJWT} = require('../middlewares/auth');

const usersController = require('../controller/usersController');

// Get users given a search pattern
router.get( '/',
            authJWT,
            usersController.getUsers
);

module.exports = router;