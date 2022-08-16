const Spaces = require('mongoose').model("Spaces")
const {logEvent} = require('../logs/logEvents');


async function getSpaces (req, res) {
    try {
        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        let spaces = await Spaces.find({users: {$elemMatch: {userId: user.userId}}});

        res.status(200).send({
            status: "success",
            spaces
        });

    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}


async function createSpace (req, res) {

    try {
        const spacename = req.body.spacename; 

        if (!spacename)  return res.status(400).send({status: 'fail', message: 'spacename not provided'});

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        const space = {
            spacename,
            admins: user,
            users: user
        };

        let spaceCreated = await Spaces.create(space);

        res.status(200).send({
            status: "success",
            message: `space ${spaceCreated.spacename} created`
        });

    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}


async function deleteSpace (req, res) {
    try {
        const spaceId = req.params.id;

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        // Check if space exists.
        let space = await Spaces.findById({_id: spaceId }, {_id: 0, admins: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user is admin
        const isAdmin = space.admins.find(e => e.userId === user.userId);
        if (!isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin.`
            });
        }

        // Delete space
        let spaceDeleted = await Spaces.findByIdAndDelete({_id: spaceId});
        res.status(200).send({
            status: "success",
            message: `space ${spaceDeleted.spacename} deleted.`
        });
      
    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}


async function joinSpace (req, res) {
    try {

        const spaceId = req.params.id;

        const userJoining = {
            username: req.body.username,
            userId: req.body.userId
        };

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        if (!userJoining.userId) {
            return res.status(400).send({status: 'fail', message: 'userId not provided'});
        }

        // Check if space exists.
        let space = await Spaces.findOne({_id: spaceId }, {_id: 0, spacename: 1, admins: 1, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user is admin
        const isAdmin = space.admins.find(e => e.userId === user.userId);
        if (!isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin.`
            });
        }

        // Check if user already joined the space
        let alreadyJoined = await Spaces.findOne({_id: spaceId, "users.userId": userJoining.userId})
        if (alreadyJoined) {
            return res.status(400).send({
                status: 'error',
                message: `user ${userJoining.username} has already joined this space`
            });
        }

        await Spaces.findOneAndUpdate(
            {_id: spaceId}, 
            {$push: {users: userJoining}});
        

        res.status(200).send({
            status: "success",
            message: `user ${userJoining.username} joined space ${spaceId}`
        });

    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}
    
async function leaveSpace (req, res) {
    try {
        const spaceId = req.params.id;
        
        const userLeaving = {
            username: req.body.username,
            userId: req.body.userId
        };

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        if (!userLeaving.userId) return res.status(400).send({status: 'fail', message: 'userId not provided'});

        let space = await Spaces.findOne({_id: spaceId}, {_id: 0, admins: 1, users: 1, spacename: 1});

        // Check if space exists.
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if userLeaving is user of the space
        const isUser = space.users.find(e => e.userId === userLeaving.userId);
        if (!isUser) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userToAdmin.username} has not joined this space.`
            });
        }

        // Check for permissions: check if user is admin or is self user.
        const userIsAdmin = space.admins.find(e => e.userId === user.userId);
        if ((!userIsAdmin) && (user.userId !== userLeaving.userId)) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin.`
            });
            
        }

        // Check if is the last admin
        if ((space.admins.length === 1) && (space.admins[0].userId === userLeaving.userId)) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userIsAdmin.username} is last admin. Asing another admin.`
            });
        }

        // Remove from users
        await Spaces.findByIdAndUpdate(
            {_id: spaceId},
            {$pull: {users: {userId: userLeaving.userId}}});

        // Remove from admins
        await Spaces.findByIdAndUpdate(
            {_id: spaceId},
            {$pull: {admins: {userId: userLeaving.userId}}});

        res.status(200).send({
            status: "success",
            message: `user ${userLeaving.username} left space ${spaceId}`
        });

    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}


async function addAdminSpace (req, res) {
    try {
        const spaceId = req.params.id;

        const userToAdmin = {
            username: req.body.username,
            userId: req.body.userId
        };

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        // Check given JSON parameters
        if (!userToAdmin.userId) return res.status(400).send({status: 'fail', message: 'userId not provided'});

        // Check if space exists.
        let space = await Spaces.findOne({_id: spaceId }, {_id: 0, spacename: 1, admins: 1, users: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user is admin
        const isAdmin = space.admins.find(e => e.userId === user.userId);
        if (!isAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin.`
            });
        }

        // Check if user to make admin is user of the space
        const isUser = space.users.find(e => e.userId === userToAdmin.userId);
        if (!isUser) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userToAdmin.username} has not joined this space.`
            });
        }

        // Check if user to make admin is already admin
        const isAlreadyAdmin = space.admins.find(e => e.userId === userToAdmin.userId);
        if (isAlreadyAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userToAdmin.username} is already admin.`
            });
        }

        await Spaces.findByIdAndUpdate({_id: spaceId}, {$push: {admins: userToAdmin}});

        res.status(200).send({
            status: "success",
            message: `user ${userToAdmin.username} added as admin in space ${space.spacename}.`
        });

    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}


async function deleteAdminSpace (req, res) {
    try {
        const spaceId = req.params.id;

        const userToDowngrade = {
            username: req.body.username,
            userId: req.body.userId
        };

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        // Check given parameters
        if (!userToDowngrade.userId) return res.status(400).send({status: 'fail', message: 'userId not provided'});

        // Check if space exists.
        let space = await Spaces.findOne({_id: spaceId }, {_id: 0, spacename: 1, admins: 1});
        if (!space) {
            return res.status(400).send({
                status: `fail`,
                message: `space not found.`
            });
        }

        // Check if user is admin
        const userIsAdmin = space.admins.find(e => e.userId === user.userId);
        if (!userIsAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${user.username} is not admin.`
            });
        }

        // Check if user to downgrade is admin
        const userToDownIsAdmin = space.admins.find(e => e.userId === userToDowngrade.userId);
        if (!userToDownIsAdmin) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userToDowngrade.username} is not admin.`
            });
        }

        // Check if is the last admin
        if (space.admins.length === 1) {
            return res.status(400).send({
                status: `fail`,
                message: `user ${userToDowngrade.username} is last admin. Asing another admin.`
            });
        }

        await Spaces.findByIdAndUpdate( {_id: spaceId}, {$pull: {admins: {userId: userToDowngrade.userId}}});

        res.status(200).send({
            status: "success",
            message: `user ${userToDowngrade.username} removed from admin.`
        });

    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}


module.exports = {createSpace, getSpaces, joinSpace, leaveSpace, deleteSpace, addAdminSpace, deleteAdminSpace};