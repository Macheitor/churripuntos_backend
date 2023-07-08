// Cross Origin Resource Sharing
const whitelist = ['https://www.myWebsite.com']

if (process.env.NODE_ENV !== 'production') {
    whitelist.push(
        'http://127.0.0.1:5500',
        'http://localhost:8080',
        'http://localhost:5173',
        'localhost:8080')
}

const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin){
            callback(null, true)
        } else {
            callback(new Error ('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;