const express = require('express');
const router = express.Router();

const {authJWT} = require('../middlewares/auth');
const {createSpace, getSpaces} = require('../controller/spaces');

router.get( '/',
             authJWT,
             getSpaces);

router.post( '/',
             authJWT,
             createSpace);

module.exports = router;