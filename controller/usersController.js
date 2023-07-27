const Users = require('mongoose').model("Users");
const Spaces = require('mongoose').model("Spaces");
const {errLogger} = require('../middlewares/logger');


async function getUsers (req, res) {

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


async function getSpaces (req, res) {
    try {
        // Check if userId URL parameter matches the userId inside the jwt
        if (req.params.userId !== req._id)  return res.status(400).send({status: 'fail', message: 'user not authorized'});

        // Search the spaces this user is in
        const spaces = await Spaces.find({users: {$elemMatch: {_id: req._id}}});

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

module.exports = {
    getUsers,
    getSpaces,
    deleteUser
};