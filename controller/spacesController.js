const Spaces = require('mongoose').model("Spaces")
const Users = require('mongoose').model("Users")
const {errLogger} = require('../middlewares/logger');


async function createSpace (req, res) {

    try {
        // Check the parameters from body
        if (!req.body.spacename)  return res.status(400).send({status: 'fail', message: 'spacename not provided'});

        // Take parameters from body
        const spacename = req.body.spacename.replace(/^\s+|\s+$/g, "");

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
        };

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
        let space = await Spaces.findOne({_id: req.params.spaceId});

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

        // Get the space users's ID
        const spaceUsersId = space.users.map(user => user._id)

        // Get the spaces users's username from DB
        const users = await Users.find({_id: { $in: spaceUsersId}}, {_id: 1, username: 1})

        space._doc.users = space.users.map(su => {
            let user = su
            user._doc.username = users.find(u => u._id.toString() === su._id.toString()).username
            return user
        })

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

        const userJoiningEmail = req.body.email;

        if (!userJoiningEmail) return res.status(400).send({status: 'fail', message: 'email not provided'});

        // Check if userJoining exists.
        const userJoining = await Users.findOne({email: userJoiningEmail });
        if (!userJoining) {
            return res.status(400).send({
                status: `fail`,
                message: `user not found`
            });
        }

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
        const alreadyJoined = space.users.find(user => (user._id.toString() === userJoining._id.toString()))

        if (alreadyJoined) {
            // Check if user was deleted from this space
            if (alreadyJoined.isDeleted) {
                await Spaces.findOneAndUpdate(
                    {_id: spaceId, "users": { "$elemMatch": { "_id": alreadyJoined._id }}},
                    { $set: {"users.$.isDeleted": false}});
            } else {   
                return res.status(400).send({
                    status: 'fail',
                    message: `user ${userJoining.username} has already joined this space`
                });
            }
        } else {
            await Spaces.findOneAndUpdate(
                {_id: spaceId},
                {$push: {users: userJoining}});
        }
    
        res.status(200).send({
            status: "success",
            user: userJoining
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

        // Check if userLeaving exist and is not already deleted
        const userLeavingExists = space.users.find(u => (u._id.toString() === userLeaving._id) && (!u.isDeleted));
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
                message: `user ${userLeavingExists.username} is last admin. Asing another admin.`
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
        // await Spaces.findOneAndUpdate(
        //     {_id: spaceId},
        //     {$pull: {users: {_id: userLeaving._id}}});

        // New delete user
        await Spaces.findOneAndUpdate(
            {_id: spaceId, "users": { "$elemMatch": { "_id": userLeaving._id }}},
            { $set: {"users.$.isDeleted": true, "users.$.isAdmin": false}});

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

        const userToAdminId = req.body.userId

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
        const userToAdmin = space.users.find(u => u._id.toString() === userToAdminId);
        if (!userToAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user to make admin is not in this space.`
            });
        }

        // Check if user to make admin is already admin
        if (userToAdmin.isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user to make admin is already admin in this space.`
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

        const userToDowngradeId = req.params.userId

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
                message: `User requesting is not in this space.`
            });
        }

        // Check if user is admin
        if (!userExists.isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `User requesting is not admin of this space.`
            });
        }

        // Check if user to make admin exist
        const userToDowngrade = space.users.find(u => u._id.toString() === userToDowngradeId);
        if (!userToDowngrade) {
            return res.status(400).send({
                status: `fail`,
                message: `User to downgrade is is not in this space.`
            });
        }

        // Check if is the last admin
        const admins = space.users.filter(u => u.isAdmin);
        console.log(admins)

        if (admins.length === 1) {
            return res.status(400).send({
                status: `fail`,
                message: `User to downgrade is last admin. Asing another admin first.`
            });
        }

        await Spaces.findOneAndUpdate(
            {_id: spaceId, "users": { "$elemMatch": { "_id": userToDowngrade._id }}},
            { $set: {"users.$.isAdmin": false}});


        res.status(200).send({
            status: "success",
            message: `user removed from admin.`
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

        const task = req.body.task
        const taskUser = req.body.user
        
        // const taskId = req.body.taskId;
        // const userActivityId = req.body.userId;

        // Check given parameters
        if (!task) return res.status(400).send({status: 'fail', message: 'task not provided'});
        if (!taskUser) return res.status(400).send({status: 'fail', message: 'user not provided'});
        // if (!taskId) return res.status(400).send({status: 'fail', message: 'taskId not provided'});
        // if (!userActivityId) return res.status(400).send({status: 'fail', message: 'userId not provided'});

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
        const userActivityExists = space.users.find(u => u._id.toString() === taskUser._id);
        if (!userActivityExists) {
            return res.status(400).send({
                status: `fail`,
                message: `user who did activity is not in this space.`
            });
        }

        // Check if task exist
        const taskExists = space.tasks.find(t => t._id.toString() === task._id);

        if (!taskExists) {
            return res.status(400).send({
                status: `fail`,
                message: `task does not exist in this space.`
            });
        }

        const  activity = {
            username: taskUser.username,
            userId: taskUser._id,
            taskId: task._id,
            taskname: task.taskname,
            points: task.points,
            date: new Date()
        }

        const spaceUpdated = await Spaces.findOneAndUpdate (
            {_id: spaceId},
            {$push: {activities: activity}},
            {returnDocument: "after"});

        const activityCreated = spaceUpdated.activities.at(-1)

        res.status(200).send({
            status: "success",
            activity: activityCreated
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