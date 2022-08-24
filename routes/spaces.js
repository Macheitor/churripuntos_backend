const express = require('express');
const router = express.Router();

const spacesController = require('../controller/spacesController');

// Space CRUD
router.route( '/:spaceId')
    .delete(spacesController.deleteSpace);

// Users CRUD
router.route( '/:spaceId/users')
    .get(spacesController.getSpaceUsers)
    .put(spacesController.joinSpace)
    .delete(spacesController.leaveSpace);

// Admins CRUD
router.route('/:spaceId/admins')
    .post(spacesController.createAdmin)
    .delete(spacesController.deleteAdmin);

// Tasks CRUD
router.route('/:spaceId/tasks')
    .get(spacesController.getTasks)
    .post(spacesController.createTask)
    .put(spacesController.updateTask)
    .delete(spacesController.deleteTask);

// Activities CRUD
router.route('/:spaceId/activities')
    .get(spacesController.getActivities)
    .post(spacesController.createActivity)
    .delete(spacesController.deleteActivity);

module.exports = router;