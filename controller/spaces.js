const Spaces = require('mongoose').model("Spaces")

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

        await Spaces.create(space);

        res.status(200).send({
            status: "success",
            message: `space ${spacename} created`
        });

    } catch (err) {
        res.status(500).send({
            status: 'error',
            message: err.message
        })
    }
}

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

async function joinSpace (req, res) {
    
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
    let result = await Spaces.updateOne(
        {_id: spaceId}, 
        {$push: {users: user}}
    );

    console.log(result)

    res.status(200).send({
        status: "success",
        message: `user ${user.username} joined space ${spaceId}`
    });
}

async function leaveSpace (req, res) {

}

module.exports = {createSpace, getSpaces, joinSpace, leaveSpace};