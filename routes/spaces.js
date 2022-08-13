const express = require('express');
const router = express.Router();

const {authJWT} = require('../middlewares/auth');
const {createSpace, getSpaces, joinSpace, leaveSpace, deleteSpace} = require('../controller/spaces');

router.get( '/',
            authJWT,
            getSpaces);

router.post( '/',
             authJWT,
             createSpace);

router.put( '/:id/join',
            authJWT,
            joinSpace);

router.put( '/:id/leave',
            authJWT,
            leaveSpace);

router.delete( '/:id',
                authJWT,
                deleteSpace);


module.exports = router;