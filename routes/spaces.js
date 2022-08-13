const express = require('express');
const router = express.Router();

const {authJWT} = require('../middlewares/auth');
const {createSpace, getSpaces, joinSpace} = require('../controller/spaces');

router.get( '/',
            authJWT,
            getSpaces);

router.post( '/',
             authJWT,
             createSpace);

router.put( '/:id', 
            authJWT,
            joinSpace);


module.exports = router;