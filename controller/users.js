const Users = require('mongoose').model("Users");
const {logEvent} = require('../logs/logEvents');

async function getUsers (req, res) {

    try {
        const search = req.params.id;

        let users = await Users.find({username: new RegExp('^' + search)}, {_id: 0, username: 1});

        users = users.map(e => e.username)

        res.status(200).send({
            status: "success",
            users
        });

    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}


module.exports = {getUsers};