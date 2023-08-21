if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const {errLogger} = require('../middlewares/logger');

module.exports = async (req, res) => {

    try {
        res.status(200).send({
            status: "success",
            message: "Valid accesToken"
        });

     } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}