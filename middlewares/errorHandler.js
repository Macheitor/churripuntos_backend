const {errLogger} = require('./logger');

const errorHandler = (err, req, res, next) => {
    logEvent(`${err.name}: ${err.message}`, 'errLog.txt');
    console.error(err.stack);
    res.status(500).send({ status: 'error', code: '500', message: err.message });
}

module.exports = {errorHandler};
