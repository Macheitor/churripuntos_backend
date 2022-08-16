const express = require('express');
const app = express();

app.use(express.json());

// Create Database if not exists
require('./models/models.js')();

app.get('/', (req, res) =>{
    res.send('Home page');
})

app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/spaces', require('./routes/spaces'));
app.use('/users', require('./routes/users'));
app.use((req, res) => res.status(404).send({ status: "fail", message: "PAGE NOT FOUND"}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));

