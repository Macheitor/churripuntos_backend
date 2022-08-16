const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const fs = require('fs').promises;
const path = require('path');

const logEvent = async (message) => {
    try {
        const dateTime = `${format(new Date(), 'yyyyMMdd-HH:mm:ss')}`;
        const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
        await fs.appendFile(path.join(__dirname, 'eventLog.txt'), logItem);
    } catch(err) {
        console.error(err);
    }
}

module.exports = { logEvent };