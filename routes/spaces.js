const express = require('express');
const router = express.Router();

const {authJWT} = require('../middlewares/auth');

const spacesController = require('../controller/spacesController');

// Get all spaces of the current user
router.get( '/',
            authJWT,
            spacesController.getSpaces);

// Create a space
router.post( 
    '/',
    authJWT,
    spacesController.createSpace
);

// Delete space
router.delete( '/:spaceId',
                authJWT,
                spacesController.deleteSpace
);

// Join space
router.put( '/:spaceId/join',
            authJWT,
            spacesController.joinSpace
);

// Leave space | Kick someone from space
router.put( '/:spaceId/leave|/:spaceId/kick',
            authJWT,
            spacesController.leaveSpace
);

// Add admin to space
router.put( '/:spaceId/admins/add',
            authJWT,
            spacesController.addAdmin
);

// Remove admin from space
router.put( '/:spaceId/admins/remove',
            authJWT,
            spacesController.removeAdmin
);

// Get all tasks from this space
router.get( '/:spaceId/tasks',
            authJWT,
            spacesController.getTasks
);

// Create task
router.post( '/:spaceId/tasks',
            authJWT,
            spacesController.createTask
);

// Delete task
router.delete( '/:spaceId/tasks/:taskId',
            authJWT,
            spacesController.deleteTask
);

// update task
router.put( '/:spaceId/tasks/:taskId',
            authJWT,
            spacesController.updateTask
);



module.exports = router;