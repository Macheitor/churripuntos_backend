module.exports = async (req, res) => {
const {logEvent} = require('../logs/logEvents');

    try {
        res.status(201).send({
            status: "success"
        });

     } catch(err) {
        const error = { status: 'error', message: err.message }; 
        res.status(500).send(error);
        logEvent(error.message);
    }
}
