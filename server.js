const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) =>{
    res.send('Home page');
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));