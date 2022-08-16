const express = require('express');
const router = express.Router();

const {authJWT} = require('../middlewares/auth');

const { getUsers
} = require('../controller/users');

router.get( '/:id',
            authJWT,
            getUsers);

module.exports = router;