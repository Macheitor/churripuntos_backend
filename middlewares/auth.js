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

    if (!email) return res.status(400).send({ status: "fail", message: errorMsg});
    if (!password) return res.status(400).send({ status: "fail", message: errorMsg});

    // Check if user exists
    const user = await Users.findOne({email});
    if(!user) return res.status(400).send({ status: "fail", message: errorMsg});

    // Check if the password is right
    if (!await bcrypt.compare(password, user.password)) {
        return res.status(403).send({
            status: 'fail',
            message: errorMsg
        })
    }

    req.username = user.username;
    req.email = user.email;
    req._id = user._id;
    req.validated = user.validated
    next();
}

module.exports = {
    authentication,
    authJWT
};