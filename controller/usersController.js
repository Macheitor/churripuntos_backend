const Users = require('mongoose').model("Users");
const Spaces = require('mongoose').model("Spaces");
const {errLogger} = require('../middlewares/logger');

async function getUser (req, res) {
    try {
        // Check if userId URL parameter matches the userId inside the jwt
        if (req.params.userId !== req._id)  return res.status(400).send({status: 'fail', message: 'user not authorized'});

        // Search for the user
        const user = await Users.findOne({_id: req.params.userId});

        // Return the user
        res.status(200).send({
            status: "success",
            user
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function getAllUsers (req, res) {

    try {
        // Use a search patter if provided
        const search = req.body.search || "";

        // Get db usernames
        let users = await Users.find({username: new RegExp('^' + search)}, {_id: 1, username: 1});

        // Return the users of the db
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

async function getUserSpaces (req, res) {
    try {
        // Check if userId URL parameter matches the userId inside the jwt
        if (req.params.userId !== req._id)  return res.status(400).send({status: 'fail', message: 'user not authorized'});

        // Search the spaces this user is in
        const spaces = await Spaces.find({users: {$elemMatch: {_id: req._id, isDeleted:false}}}, {_id: 1, spacename: 1});

        // Return the spaces of the user
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


async function deleteUser(req, res) {
    try {
        // Check if userId paramenter matches the userId inside the jwt
        if (req.params.userId !== req._id)  return res.status(400).send({status: 'fail', message: 'user not authorized'});

        // Delete user from db
        const userDeleted = await Users.deleteOne({ _id: req._id });

        // Check if user has been successfully deleted
        if (userDeleted.acknowledged === true &&
            userDeleted.deletedCount === 1) {
                res.status(204).send({
                    status: "success",
                    user: {
                        username: req.username,
                        _id: req._id
                    }
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


async function emailValidation (req, res) {
    try {

        const userId = req.params.userId
        const emailValidationToken = req.params.emailValidationToken

        // Find user
        const user = await Users.findOne({ _id: userId });
        if (!user) return res.sendStatus(404)

        // Check if token is valid.
        // TODO: secure this check to avoid code injections, etc
        if (user.emailValidationToken === emailValidationToken) {

        // Update user
        const userUpdated = await Users.findOneAndUpdate(
            {_id: userId},
            { $set: {"validated": true}});

            if (!userUpdated) return res.sendStatus(500)
            else return res.sendStatus(200)

        } else {
            return res.sendStatus(400)
        }
        
    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}

async function updateUsername (req, res) {
    try {
        const userId = req.params.userId
        const newUsername = req.body.newUsername;

        if (!newUsername) return res.status(400).send({status: 'fail', message: 'new username not provided'});

        // Check if userId URL parameter matches the userId inside the jwt
        if (userId !== req._id)  return res.status(400).send({status: 'fail', message: 'user not authorized'});

        await Users.findOneAndUpdate(
            {_id: userId},
            { $set: {"username": newUsername}});

        res.status(200).send({
            status: "success",
            newUsername
        });

    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}

module.exports = {
    getUser,
    getAllUsers,
    getUserSpaces,
    deleteUser,
    emailValidation,
    updateUsername
};