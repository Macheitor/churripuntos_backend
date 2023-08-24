const express = require('express');
const router = express.Router();

const usersController = require('../controller/usersController');

router.route('/')
    .get(usersController.getUser)
    // .get(usersController.getAllUsers);

router.route('/:userId')
    .put(usersController.updateUsername)
    .delete(usersController.deleteUser)

router.route('/:userId/spaces')
    .get(usersController.getUserSpaces)

module.exports = router;