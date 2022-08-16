const bcrypt = require('bcrypt');
const Users = require('mongoose').model('Users');
const {errLogger} = require('../middlewares/logger');

module.exports = async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        if (!username) return res.status(400).send({status: 'fail', message: 'username not provided'});
        if (!email) return res.status(400).send({status: 'fail', message: 'email not provided'});
        if (!password) return res.status(400).send({ status: "fail", message: `password not provided`});

        if (/\s/.test(username)) return res.status(400).send({ status: "fail", message: `User name cannot have spaces`});

        const userExists = await Users.find({$or: [{username}, {email}]});

        if (userExists.length > 0) return res.status(400).send({ status: "fail", message: `username or email already registered`});

        const hashedPassword = await bcrypt.hash(password, 10);

        await Users.create({ username, email, password: hashedPassword });

        res.status(201).send({
            status: "success", 
            message: `user ${username} with ${email} registered`
        });
        
    } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        errLogger(error.message);
    }

}