const {errLogger} = require('../middlewares/logger');
const Users = require('mongoose').model("Users")

async function checkEmailValidation (req, res) {
    try {

        const userId = req.params.userId
        const token = req.params.token

        // Find user
        const user = await Users.findOne({ _id: userId });
        if (!user) return res.sendStatus(404)

        // Check if token is valid.
        // TODO: secure this check to avoid code injections, etc
        if (user.emailValidationToken === token) {

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

module.exports = {
    checkEmailValidation,

};