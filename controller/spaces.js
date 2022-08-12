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
        console.log(spaces)

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

module.exports = {createSpace, getSpaces};