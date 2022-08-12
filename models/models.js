require('dotenv').config();

const mongoose = require('mongoose');

module.exports = async () => {

    let mongoDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;

    mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true});

    const usersSchema = new mongoose.Schema({
        username: String,
        email: String,
        password: String,
        validated: Boolean
    }, {timestamps: true});

    const spacesSchema = new mongoose.Schema({
        spacename: String,
        admins:[{username: String, userId: String}], 
        users: [{username: String, userId: String, color: String}],
        tasks: [{taskname: String, points: Number}],
        activities: [{username: String, userId: String, color: String, taskname: String, points: Number, date: Date, validated: Boolean}],
    }, {timestamps: true});

    mongoose.model('Users', usersSchema);
    mongoose.model('Spaces', spacesSchema);
    
}

