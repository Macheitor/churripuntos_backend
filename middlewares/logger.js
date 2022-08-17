const path = require('path');
const fs = require('fs')
const fsPromises = require('fs').promises;
const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const logEvent = async (message, filename) => {
    try {
        const dateTime = `${format(new Date(), 'yyyyMMdd-HH:mm:ss')}`;
        const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

        if (!fs.existsSync(path.join(__dirname, '../_logs'))){
            await fsPromises.mkdir(path.join(__dirname, '../_logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '../_logs', filename), logItem);
    } catch(err) {
        console.error(err);
    }
}

const errLogger = (message) => {
    logEvent(`${message}`, 'errLog.txt');
}

const reqLogger = (req, res, next) => {
    logEvent(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    next();
}

module.exports = { reqLogger, errLogger };