const express = require('express');
const router = express.Router();

const {authJWT} = require('../middlewares/auth');

const spacesController = require('../controller/spacesController');

router.get( '/',
            authJWT,
            spacesController.getSpaces);

router.post( 
    '/',
    authJWT,
    spacesController.createSpace
);

router.put( '/:id/join',
            authJWT,
            spacesController.joinSpace);

router.put( '/:id/leave',
            authJWT,
            spacesController.leaveSpace);

router.put( '/:id/addAdmin',
            authJWT,
            spacesController.addAdminSpace);

router.put( '/:id/deleteAdmin',
            authJWT,
            spacesController.deleteAdminSpace);

router.delete( '/:id',
                authJWT,
                spacesController.deleteSpace);


module.exports = router;