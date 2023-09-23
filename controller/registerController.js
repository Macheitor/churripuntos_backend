if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const bcrypt = require('bcrypt');
const Users = require('mongoose').model('Users');
const {errLogger} = require('../middlewares/logger');
const utils = require('../utils/sendEmail')


async function registerUser(req, res) {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        if (!username) return res.status(400).send({status: 'fail', message: 'username not provided'});
        if (!email) return res.status(400).send({status: 'fail', message: 'email not provided'});
        if (!password) return res.status(400).send({ status: "fail", message: `password not provided`});

        const userExists = await Users.findOne({email});

        if (userExists) {
            return res.status(400).send({ status: "fail", message: `email already registered`});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const currentDate = new Date().getTime();
        const random = require('crypto').randomBytes(16).toString('hex')
        const emailValidationToken = currentDate + random

        const user = await Users.create({ username, email, password: hashedPassword, emailValidationToken });
        // TODO: Check user has been created properly

        utils.sendValidationEmail(user)

        res.sendStatus(201);
        
    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}

module.exports = {
    registerUser
};