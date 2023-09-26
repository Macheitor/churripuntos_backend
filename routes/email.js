const express = require('express');
const router = express.Router();

// TODO: rething this controller, now i'm feeling lazy and have tons of other prio things to do

const usersController = require('../controller/emailsController');

router.route('/:userId/token/:token')
  .get(usersController.checkEmailValidation)

module.exports = router;