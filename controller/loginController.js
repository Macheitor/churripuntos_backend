if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const {errLogger} = require('../middlewares/logger');

const Users = require('mongoose').model("Users")
const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

    try {
        const username = req.body.username;
        const email = req.body.email;

        const userEntry = await Users.findOne({$or: [{username}, {email}]});

        const user = {
            userId: userEntry._id,
            username: userEntry.username,
            email: userEntry.email
        }

        const accessToken = jwt.sign(user, process.env.DEV_ACCESS_TOKEN_SECRET)

        res.status(200).send({
            status: "success", 
            user,
            accessToken
        });

     } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}