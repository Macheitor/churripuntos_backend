if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const {errLogger} = require('../middlewares/logger');

const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

    try {
        // Comparing the decoded jwt values with given request values
        if (req.body.username === req.username &&
            req.body.userId === req._id) {

                res.status(200).send({
                    status: "success",
                    message: "Session is valid"
                });
            } else {
                res.status(403).send({status: 'fail', message: 'Session is not valid'});
            }

     } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}