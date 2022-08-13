const Spaces = require('mongoose').model("Spaces")


async function getSpaces (req, res) {
    try {
        const userId = req.userId;

        let spaces = await Spaces.find({users: {$elemMatch: {userId}}});

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

        const username = req.username;
        const email = req.email;
        const userId = req.userId;

        const space = {
            spacename,
            admins: {username, email, userId},
            users: {username, email, userId}
        };

        let spaceCreated = await Spaces.create(space);

        res.status(200).send({
            status: "success",
            message: `spacename ${spaceCreated.spacename} with space id ${spaceCreated._id} created`
        });

    } catch (err) {
        res.status(500).send({
            status: 'error',
            message: err.message
        })
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
            res.status(409).send({
                status: 'error',
                message: `user already joined this space`
            });
            return;
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
        
        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        let userLeft = await Spaces.findOneAndUpdate(
            {_id: spaceId, "users.userId": user.userId},
            {$pull: {users: {userId: user.userId}}});

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


async function deleteSpace (req, res) {
    try {
        const spaceId = req.params.id;

        const user = {
            username: req.username,
            email: req.email, 
            userId: req.userId
        };

        let spaceDeleted = await Spaces.findOneAndDelete(
            {_id: spaceId, "admins.userId": user.userId}, 
        );

        if (spaceDeleted) {   
            res.status(200).send({
                status: "success",
                message: `${spaceDeleted.spacename} with space id ${spaceDeleted._id} deleted.`
            });
        } else {
            res.status(400).send({
                status: "fail",
                message: ` user ${user.username} is not admin of space id ${spaceId}.`
            });
        }
    } catch (err) {
        res.status(500).send({status: 'error', message: err.message})
    }
}


module.exports = {createSpace, getSpaces, joinSpace, leaveSpace, deleteSpace};