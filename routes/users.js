const express = require('express');
const router = express.Router();

const usersController = require('../controller/usersController');

router.route('/')
    .get(usersController.getUsers);

router.route('/:userId')
    .get(usersController.getUserSpaces)
    // .delete(usersController.deleteUser)

module.exports = router;