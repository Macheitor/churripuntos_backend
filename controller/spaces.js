const Spaces = require('mongoose').model("Spaces")


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

    } catch (err) {
        res.status(500).send({
            status: 'error',
            message: err.message
        })
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

    } catch (err) {
        res.status(500).send({ status: 'error', message: err.message })
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
        let space = await Spaces.findOne({_id: spaceId }, {_id: 0, admins: 1});
        if (!space) {
            return res.status(400).send({
                status: "fail",
                message: `space not found.`
            });
        }

        // Check if user is admin
        const isAdmin = space.admins.find(e => e.userId === user.userId);
        if (!isAdmin) {
            return res.status(400).send({
                status: "fail",
                message: `user ${user.username} is not admin.`
            });
        }

        // Delete space
        let spaceDeleted = await Spaces.findOneAndDelete({_id: spaceId});
        res.status(200).send({
            status: "success",
            message: `space ${spaceDeleted.spacename} deleted.`
        });
      
    } catch (err) {
        res.status(500).send({status: 'error', message: err.message})
    }
}


async function joinSpace (req, res) {
    try {

        const spaceId = req.params.id;

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        let alreadyJoined = await Spaces.findOne({_id: spaceId, "users.userId": user.userId})
        
        if (alreadyJoined) {
            return res.status(409).send({
                status: 'error',
                message: `user has already joined this space`
            });
        }

        // Join only if not already there
        let spaceJoined = await Spaces.findOneAndUpdate(
            {_id: spaceId}, 
            {$push: {users: user}});
        
        if (spaceJoined) {
            res.status(200).send({
                status: "success",
                message: `user ${user.username} joined space ${spaceId}`
            });
        } else {
            res.status(409).send({
                status: 'error',
                message: `space id not found`
            });
        }
    } catch (err) {
        res.status(500).send({status: 'error', message: err.message})
    }
}
    
async function leaveSpace (req, res) {
    try {
        const spaceId = req.params.id;
        
        const userToDelete = {
            username: req.body.username,
            userId: req.body.userId
        };

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        if (!userToDelete.userId) return res.status(400).send({status: 'fail', message: 'userId not provided'});

        let admins = await Spaces.find({_id: spaceId}, {_id: 0, admins: 1});
        console.log("************")
        console.log(admins)
        console.log(admins[0])
        console.log(admins[0].admins[0].userId)
        console.log(typeof(admins))
        console.log(admins.lenght)
        if (admins && 
            admins.lenght === 1 && 
            admins[0].admins[0].userId === userToDelete.userId) {

            return res.status(400).send({
                status: "fail",
                message: `You are the last admin. Asign another admin or delete the space.`
            });
        }

        let userLeft = await Spaces.findOneAndUpdate(
            {_id: spaceId, "users.userId": user.userId},
            {$pull: {admins: {userId: user.userId}},
             $pull: {users: {userId: user.userId}}});

        if (userLeft) {
            res.status(200).send({
                status: "success",
                message: `user ${user.username} left space ${spaceId}`
            });
        } else {
            res.status(400).send({
                status: "fail",
                message: `user ${user.username} not found in space id ${spaceId}`
            });
        }

    } catch (err) {
        res.status(500).send({status: 'error', message: err.message})
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
                status: "fail",
                message: `space not found.`
            });
        }

        // Check if user is admin
        const isAdmin = space.admins.find(e => e.userId === user.userId);
        if (!isAdmin) {
            return res.status(400).send({
                status: "fail",
                message: `user ${user.username} is not admin.`
            });
        }

        // Check if user to make admin is user of the space
        const isUser = space.users.find(e => e.userId === userToAdmin.userId);
        if (!isUser) {
            return res.status(400).send({
                status: "fail",
                message: `user ${userToAdmin.username} has not joined this space.`
            });
        }

        // Check if user to make admin is already admin
        const isAlreadyAdmin = space.admins.find(e => e.userId === userToAdmin.userId);
        if (isAlreadyAdmin) {
            return res.status(400).send({
                status: "fail",
                message: `user ${userToAdmin.username} is already admin.`
            });
        }

        await Spaces.findOneAndUpdate({_id: spaceId}, {$push: {admins: userToAdmin}});

        res.status(200).send({
            status: "success",
            message: `user ${userToAdmin.username} added as admin in space ${space.spacename}.`
        });

    } catch (err) {
        res.status(500).send({status: 'error', message: err.message})
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
        if (!spaceId) return res.status(400).send({status: 'fail', message: 'spaceId not provided'});

        // Check if space exists.
        let space = await Spaces.findOne({_id: spaceId }, {_id: 0, spacename: 1, admins: 1});
        if (!space) {
            return res.status(400).send({
                status: "fail",
                message: `space not found.`
            });
        }

        // Check if user is admin
        const userIsAdmin = space.admins.find(e => e.userId === user.userId);
        if (!userIsAdmin) {
            return res.status(400).send({
                status: "fail",
                message: `user ${user.username} is not admin.`
            });
        }

        // Check if user to downgrade is admin
        const userToDownIsAdmin = space.admins.find(e => e.userId === userToDowngrade.userId);
        if (!userToDownIsAdmin) {
            return res.status(400).send({
                status: "fail",
                message: `user ${userToDowngrade.username} is not admin.`
            });
        }

        // Check if is the last admin
        if (space.admins.length === 1) {
            return res.status(400).send({
                status: "fail",
                message: `user ${userToDowngrade.username} is last admin. Asing another admin.`
            });
        }

        await Spaces.findOneAndUpdate( {_id: spaceId}, {$pull: {admins: {userId: userToDowngrade.userId}}});

        res.status(200).send({
            status: "success",
            message: `user ${userToDowngrade.username} removed from admin.`
        });

    } catch (err) {
        res.status(500).send({status: 'error', message: err.message})
    }
}


module.exports = {createSpace, getSpaces, joinSpace, leaveSpace, deleteSpace, addAdminSpace, deleteAdminSpace};