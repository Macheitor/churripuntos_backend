const express = require('express');
const router = express.Router();

const usersController = require('../controller/usersController');

// Users CRUD
router.route('/')
    .get(usersController.getUsers);

// Board CRUD
router.route('/')
    .get(usersController.getSpaces)
    .post(usersController.createSpace)

module.exports = router;