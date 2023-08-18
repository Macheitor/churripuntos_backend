const Spaces = require('mongoose').model("Spaces")
const Users = require('mongoose').model("Users")
const {errLogger} = require('../middlewares/logger');


async function createSpace (req, res) {

    try {

        // Check the parameters from body
        if (!req.body.spacename)  return res.status(400).send({status: 'fail', message: 'spacename not provided'});
        // if (!req.body.color)  return res.status(400).send({status: 'fail', message: 'color not provided'});

        // Take parameters from body
        const spacename = req.body.spacename.replace(/^\s+|\s+$/g, "");
        // const color = req.body.color;

        // Check if it is a valid taskname
        if (spacename === '') {
            return res.status(400).send({
                status: `fail`,
                message: `Invalid spacename.`
            });
        }

        // Build user object
        const user = {
            isAdmin: true,
            username: req.username,
            _id: req._id,
            //color
        };

        
        // Search if this space is already created
        const spaceExists = await Spaces.findOne({spacename});

        if (spaceExists) {
            return res.status(400).send({ status: "fail", message: `spacename already created`});
        }

        // Create the space
        const spaceCreated = await Spaces.create({spacename, users: user});

        // Return the space created
        res.status(200).send({
            status: "success",
            space: { spacename, _id: spaceCreated._id}
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function getSpace (req, res) {
    try {

        // Search the space
        const space = await Spaces.findOne({_id: req.params.spaceId});

        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === req._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${req.username} is not in this space.`
            });
        }

        // Return the space
        res.status(200).send({
            status: "success",
            space
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function deleteSpace (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Check if user is admin
        if (!userExists.isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin of this space.`
            });
        }

        // Delete space
        const spaceDeleted = await Spaces.findOneAndDelete({_id: spaceId});
        res.status(200).send({
            status: "success",
            message: "space deleted.",
            space: {
                spacename: spaceDeleted.spacename,
                spaceId
            }
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function updateSpacename (req, res) {
    try {

        // Search the space
        const spaceId = req.params.spaceId;
        const space = await Spaces.findOne({_id: spaceId});

        const newSpacename = req.body.newSpacename;

        if (!newSpacename) return res.status(400).send({status: 'fail', message: 'spacename not provided'});
        if (!space) return res.status(400).send({status: `fail`, message: `space not found.`});
        if (newSpacename === space.spacename) return res.status(400).send({status: `fail`, message: `The new space name must be different`});


        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === req._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${req.username} is not in this space.`
            });
        }

        await Spaces.findOneAndUpdate(
            {_id: spaceId},
            { $set: {"spacename": newSpacename}});

        res.status(200).send({
            status: "success",
            message: `Spacename changed to: ${newSpacename}`
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function getSpaceUsers (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user is in this space
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        res.status(200).send({
            status: "success",
            users: space.users
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function joinSpace (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        const userJoining = {
            username: req.body.username,
            _id: req.body._id,
            // color: req.body.color
        };

        if (!userJoining._id) return res.status(400).send({status: 'fail', message: '_id not provided'});
        if (!userJoining.username) return res.status(400).send({status: 'fail', message: 'username not provided'});
        // if (!userJoining.color) return res.status(400).send({status: 'fail', message: 'color not provided'});

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user is in this space
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Check if user is admin
        if (!userExists.isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin of this space.`
            });
        }

        // Check if user already joined the space
        const alreadyJoined = await Spaces.findOne({_id: spaceId, "users._id": userJoining._id})
        if (alreadyJoined) {
            return res.status(400).send({
                status: 'fail',
                message: `user ${userJoining.username} has already joined this space`
            });
        }

        // Check if userJoining exists in our users database
        const joiningUserExists = await Users.findOne({_id: userJoining._id });
        if (!joiningUserExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user joining does not exist.`
            });
        }

        await Spaces.findOneAndUpdate(
            {_id: spaceId},
            {$push: {users: userJoining}});

        res.status(200).send({
            status: "success",
            message: `user ${userJoining.username} joined this space.`
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function leaveSpace (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        const userLeaving = {
            _id: req.params.userId
        };

        // Check given JSON parameters
        if (!userLeaving._id) return res.status(400).send({status: 'fail', message: '_id not provided'});

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Check if userLeaving exist
        const userLeavingExists = space.users.find(u => u._id.toString() === userLeaving._id);
        if (!userLeavingExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userLeaving.username} is not in this space.`
            });
        }

        // Check if is the last admin
        const admins = space.users.filter(u => u.isAdmin);
        if ((admins.length === 1) && (admins[0]._id.toString() === userLeaving._id)) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userIsAdmin.username} is last admin. Asing another admin.`
            });
        }

        // Check if user is admin  if user === UserLeaving
        if ((user._id !== userLeaving._id) && (!userExists.isAdmin)) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin of this space.`
            });
        }

        // Delete user
        await Spaces.findOneAndUpdate(
            {_id: spaceId},
            {$pull: {users: {_id: userLeaving._id}}});


        res.status(200).send({
            status: "success",
            message: `user ${userLeaving._id} left this space`
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function getSpaceAdmins (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        const admins = space.users.filter(u => u.isAdmin)

        res.status(200).send({
            status: "success",
            admins
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function createAdmin (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        const userToAdmin = {
            username: req.body.username,
            _id: req.body._id
        };

        // Check given JSON parameters
        if (!userToAdmin._id) return res.status(400).send({status: 'fail', message: '_id not provided'});
        if (!userToAdmin.username) return res.status(400).send({status: 'fail', message: 'username not provided'});

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Check if user is admin
        if (!userExists.isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin of this space.`
            });
        }

        // Check if user to make admin exist
        const userToAdminExists = space.users.find(u => u._id.toString() === userToAdmin._id);
        if (!userToAdminExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userToAdmin.username} is not in this space.`
            });
        }

        // Check if user to make admin is already admin
        if (userToAdminExists.isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userToAdmin.username} is already admin in this space.`
            });
        }

        await Spaces.findOneAndUpdate(
            {_id: spaceId, "users": { "$elemMatch": { "_id": userToAdmin._id }}},
            { $set: {"users.$.isAdmin": true, "users.$._id": userToAdmin._id}});


        res.status(200).send({
            status: "success",
            message: `user ${userToAdmin.username} added as admin in this space.`
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}


async function deleteAdmin (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        const userToDowngrade = {
            username: req.body.username,
            _id: req.body._id
        };

        // Check given parameters
        if (!userToDowngrade.username) return res.status(400).send({status: 'fail', message: 'username not provided'});
        if (!userToDowngrade._id) return res.status(400).send({status: 'fail', message: '_id not provided'});

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Check if user is admin
        if (!userExists.isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin of this space.`
            });
        }

        // Check if user to make admin exist
        const userToDownIsAdmin = space.users.find(u => u._id.toString() === userToDowngrade._id);
        if (!userToDownIsAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userToAdmin.username} is not in this space.`
            });
        }

        // Check if is the last admin
        const admins = space.users.filter(u => u.isAdmin);
        if ((admins.length === 1) && (admins[0]._id.toString() === userToDowngrade._id)) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userIsAdmin.username} is last admin. Asing another admin.`
            });
        }

        await Spaces.findOneAndUpdate(
            {_id: spaceId, "users": { "$elemMatch": { "_id": userToDowngrade._id }}},
            { $set: {"users.$.isAdmin": false, "users.$._id": userToDowngrade._id}});

        res.status(200).send({
            status: "success",
            message: `user ${userToDowngrade.username} removed from admin.`
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function getTasks (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1, tasks: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        const tasks = space.tasks;
        res.status(200).send({
            status: "success",
            tasks
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function createTask (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        // Check given parameters
        if (!req.body.taskname) return res.status(400).send({status: 'fail', message: 'taskname not provided'});
        if (!req.body.points) return res.status(400).send({status: 'fail', message: 'task points not provided'});

        // Remove start and end spaces
        const task = {
            taskname: req.body.taskname.replace(/^\s+|\s+$/g, ""),
            points: req.body.points
        }

        // Check if it is a valid taskname
        if (task.taskname === '') {
            return res.status(400).send({
                status: `fail`,
                message: `Invalid taskname.`
            });
        }

        if (!Number.isInteger(task.points) || (task.points < 0)) {
            return res.status(400).send({
                status: `fail`,
                message: `Invalid points.`
            });
        }

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1, tasks: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Check if task already exists
        const taskExists = space.tasks.find(t => t.taskname === task.taskname);
        if (taskExists) {
            return res.status(400).send({
                status: `fail`,
                message: `task ${task.taskname} already exists.`
            });
        }

        const spaceUpdated = await Spaces.findOneAndUpdate(
            {_id: spaceId},
            {$push: {tasks: task}}, {returnDocument: "after"});

        const taskCreated = spaceUpdated.tasks.find(({taskname}) => taskname === task.taskname)

        res.status(200).send({
            status: "success",
            task: taskCreated
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function deleteTask (req, res) {
    try {
        const spaceId = req.params.spaceId;
        const taskId = req.params.taskId

        const user = {
            username: req.username,
            _id: req._id
        };

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1, tasks: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Remove task
        const taskDeleted = await Spaces.findOneAndUpdate(
            {_id: spaceId, "tasks._id": taskId},
            {$pull: {tasks: {_id: taskId}}});

        if (taskDeleted) {
            res.status(200).send({
                status: "success",
                message: `task ${taskId} deleted.`
            });
        } else {
            res.status(400).send({
                status: "fail",
                message: `task ${taskId} does not exist.`
            });
        }

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function updateTask (req, res) {
    try {
        if (!req.body.taskname) return res.status(400).send({status: 'fail', message: 'taskname not provided'});
        if (!req.body.points) return res.status(400).send({status: 'fail', message: 'task points not provided'});
        if (!req.body.taskId) return res.status(400).send({status: 'fail', message: 'taskId not provided'});

        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        const task = {
            taskId: req.body.taskId,
            taskname: req.body.taskname.replace(/^\s+|\s+$/g, ""),
            points: req.body.points
        }

        // Check if it is a valid taskname
        if (task.taskname === '') {
            return res.status(400).send({
                status: `fail`,
                message: `Invalid taskname.`
            });
        }

        if (!Number.isInteger(task.points) || (task.points < 0)) {
            return res.status(400).send({
                status: `fail`,
                message: `Invalid points.`
            });
        }

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1, tasks: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Check if task already exists
        const taskExists = space.tasks.find(t => t.taskname === task.taskname);
        if (taskExists) {
            return res.status(400).send({
                status: `fail`,
                message: `task ${task.taskname} already exists.`
            });
        }

        // Update task
        const taskUpdated = await Spaces.findOneAndUpdate(
            {_id: spaceId, "tasks": { "$elemMatch": { "_id": task.taskId }}},
            { $set: {"tasks.$.taskname": task.taskname, "tasks.$.points": task.points, "tasks.$._id": task.taskId}});

        // Check if a task was updated
        if (taskUpdated) {
            res.status(200).send({
                status: "success",
                message: `task updated.`,
                task
            });
        } else {
            res.status(400).send({
                status: "fail",
                message: `task ${task.taskId} does not exist.`
            });
        }

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function getActivities (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1, activities: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not in this space.`
            });
        }

        // Get activities
        res.status(200).send({
            status: `success`,
            activities: space.activities
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function createActivity (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        const taskId = req.body.taskId;
        const userActivityId = req.body.userId;

        // Check given parameters
        if (!taskId) return res.status(400).send({status: 'fail', message: 'taskId not provided'});
        if (!userActivityId) return res.status(400).send({status: 'fail', message: 'userId not provided'});

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1, tasks: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user is not in this space.`
            });
        }

        // Check if userActivity exists
        const userActivityExists = space.users.find(u => u._id.toString() === userActivityId);
        if (!userActivityExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user who did activity is not in this space.`
            });
        }

        // Check if task exist
        const taskExists = space.tasks.find(t => t._id.toString() === taskId);

        if (!taskExists) {
            return res.status(400).send({
                status: `fail`,
                message: `task does not exist in this space.`
            });
        }

        const activity = {
            username: userActivityExists.username,
            userId: userActivityExists._id,
            color: userActivityExists.color,
            taskId: taskExists._id,
            taskname: taskExists.taskname,
            points: taskExists.points,
            date: new Date()
        }

        await Spaces.findOneAndUpdate (
            {_id: spaceId},
            {$push: {activities: activity}});

        res.status(200).send({
            status: "success",
            activity
        });


    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}


async function deleteActivity (req, res) {
    try {
        const spaceId = req.params.spaceId;

        const user = {
            username: req.username,
            _id: req._id
        };

        const activityId = req.params.activityId;

        // Check if space exists.
        const space = await Spaces.findOne({_id: spaceId }, {_id: 0, users: 1, activities: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user exists
        const userExists = space.users.find(u => u._id.toString() === user._id);
        if (!userExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user is not in this space.`
            });
        }

        // Check if activity exists
        const activityExists = space.activities.find(a=> a._id.toString() === activityId);
        if (!activityExists) {
            return res.status(400).send({
                status: `fail`,
                message: `activity does not exist in this space.`
            });
        }

        // Remove activity
        const activityDeleted = await Spaces.findOneAndUpdate(
            {_id: spaceId, "activities._id": activityId},
            {$pull: {activities: {_id: activityId}}});

        if (activityDeleted) {
            res.status(200).send({
                status: "success",
                message: `activity ${activityId} deleted.`
            });
        } else {
            res.status(400).send({
                status: "fail",
                message: `activity ${activityId} does not exist.`
            });
        }

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` };
        res.status(500).send(error);
        errLogger(error.message);
    }
}

module.exports = {
    createSpace,
    getSpace,
    deleteSpace,
    updateSpacename,
    getSpaceUsers,
    joinSpace,
    leaveSpace,
    getSpaceAdmins,
    createAdmin,
    deleteAdmin,
    getTasks,
    createTask,
    deleteTask,
    updateTask,
    getActivities,
    createActivity,
    deleteActivity
};