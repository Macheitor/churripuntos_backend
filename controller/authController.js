module.exports = async (req, res) => {
const {errLogger} = require('../middlewares/logger');

    try {
        res.status(201).send({status: "success"});

     } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}
