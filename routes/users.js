const express = require('express');
const router = express.Router();

const usersController = require('../controller/usersController');

router.route('/')
// .get(usersController.getAllUsers);

router.route('/:userId')
    .get(usersController.getUser)
    .put(usersController.updateUsername)
    .delete(usersController.deleteUser)

router.route('/:userId/sendValidationEmail')
    .get(usersController.sendValidationEmail)

router.route('/:userId/spaces')
    .get(usersController.getUserSpaces)

module.exports = router;