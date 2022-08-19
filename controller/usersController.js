const Users = require('mongoose').model("Users");
const Spaces = require('mongoose').model("Spaces");
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

        if (req.params.userId !== req._id)  return res.status(400).send({status: 'fail', message: 'user not authorized'});

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

        if (req.params.userId !== req._id)  return res.status(400).send({status: 'fail', message: 'user not authorized'});


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


async function deleteUser(req, res) {
    try {

        if (req.params.userId !== req._id)  return res.status(400).send({status: 'fail', message: 'user not authorized'});

        const userDeleted = await Users.deleteOne({ _id: req._id });
        if (userDeleted.acknowledged === true &&
            userDeleted.deletedCount === 1) {
                res.status(204).send({
                    status: "success",
                    code: 204,
                    message: `Delete successfull.`
                });
        } else {
            res.status(400).send({
                status: "fail", 
                message: `Delete failed.`
            });
        }
        
    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}

module.exports = {
    getUsers,
    getSpaces,
    createSpace,
    deleteUser
};