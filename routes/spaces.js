const express = require('express');
const router = express.Router();

const spacesController = require('../controller/spacesController');

// Spaces CRUD
router.route('/')
    .get(spacesController.getSpaces)
    .post(spacesController.createSpace)
    .delete(spacesController.deleteSpace);

// Users CRUD
router.route( '/:spaceId')
    .put(spacesController.joinSpace)
    .delete(spacesController.leaveSpace);

// Admins CRUD
router.route('/:spaceId/admins')
    .post(spacesController.addAdmin)
    .delete(spacesController.removeAdmin);

// Tasks CRUD
router.route('/:spaceId/tasks')
    .get(spacesController.getTasks)
    .post(spacesController.createTask)
    .put(spacesController.updateTask)
    .delete(spacesController.deleteTask);

module.exports = router;