if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const authJWT = async (req, res, next) => {

    const jwt = require('jsonwebtoken');

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // "Bearer TOKEN"
    if (token === null) return res.sendStatus(401)
    jwt.verify(token, process.env.DEV_ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.username = decoded.username;
        req.email = decoded.email;
        req._id = decoded._id;
        next();
    })
}

const authentication = async (req, res, next) => {

    const errorMsg = "wrong email or password";
    
    const bcrypt = require('bcrypt');
    const Users = require('mongoose').model("Users")

    const email = req.body.email;
    const password = req.body.password;    
    const username = req.body.username;

    if (!username && !email) return res.status(400).send({ status: "fail", message: errorMsg});
    if (!password) return res.status(400).send({ status: "fail", message: errorMsg});

    // Check if user exists
    const userExists = await Users.findOne({$or: [{username}, {email}]});
    if(!userExists) return res.status(400).send({ status: "fail", message: errorMsg});

    // Check if the password is right
    if (!await bcrypt.compare(password, userExists.password)) {
        return res.status(400).send({
            status: 'fail',
            message: errorMsg
        })
    }

    next();
}

module.exports = {
    authentication,
    authJWT
};