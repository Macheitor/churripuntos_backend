const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const {reqLogger} = require('./middlewares/logger'); 
const {errorHandler} = require('./middlewares/errorHandler'); 

const PORT = process.env.PORT || 8080;

// Custom middleware logger
app.use(reqLogger)

// Cross Origin Resource Sharing
app.use(cors(corsOptions))

// Built-in middleware for json
app.use(express.json());

// Build-in middleware urlencoded form data
app.use(express.urlencoded({extended:false}));

// Create Database if not exists
require('./models/models.js')();

//routes
app.get('/', (req, res) =>res.send('Home page'));

app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/spaces', require('./routes/spaces'));
app.use('/users', require('./routes/users'));

app.all('*', (req, res) =>res.status(404).send({ status: 'fail', code:'404', message: 'PAGE NOT FOUND'}));
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));

