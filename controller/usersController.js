const Users = require('mongoose').model("Users");
const {errLogger} = require('../middlewares/logger');

async function getUsers (req, res) {

    try {
        const search = req.body.search;

        let users = await Users.find({username: new RegExp('^' + search)}, {_id: 0, username: 1});

        users = users.map(e => e.username)

        res.status(200).send({
            status: "success",
            users
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}


async function getSpaces (req, res) {
    try {
        const spaces = await Spaces.find({users: {$elemMatch: {_id: req._id}}});

        res.status(200).send({
            status: "success",
            spaces
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function createSpace (req, res) {

    try {
        const spacename = req.body.spacename;
        const color = req.body.color;

        if (!spacename)  return res.status(400).send({status: 'fail', message: 'spacename not provided'});
        if (!color)  return res.status(400).send({status: 'fail', message: 'color not provided'});

        const user = {
            isAdmin: true,
            username: req.username,
            _id: req._id,
            color
        };

        const spaceCreated = await Spaces.create({spacename, users: user});

        res.status(200).send({
            status: "success",
            message: "space created",
            space: { spacename, spaceId: spaceCreated._id}
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}

module.exports = {
    getUsers,
    getSpaces,
    createSpace
};