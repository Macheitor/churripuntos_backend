const express = require('express');
const app = express();
const cors = require('cors');
const {reqLogger} = require('./middlewares/logger'); 
const {authJWT} = require('./middlewares/auth');

// Create Database if not exists
require('./models/models.js')();

// Custom middleware logger
app.use(reqLogger)

// Cross Origin Resource Sharing
app.use(cors(require('./config/corsOptions')))

// Built-in middleware for json
app.use(express.json());

// Build-in middleware urlencoded form data
app.use(express.urlencoded({extended:false}));

// routes - JWT NO needed
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));

// routes - JWT YES needed
app.use(authJWT);
app.use('/spaces', require('./routes/spaces'));
app.use('/users', require('./routes/users'));
app.use('/verifySession', require('./routes/verifySession'))

// routes fallback
app.all('*', (req, res) =>res.status(404).send({ status: 'fail', code:'404', message: 'PAGE NOT FOUND'}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));

