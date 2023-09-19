if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const initDb = async () => {
    const mongoose = require('mongoose');
    const mongoDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;

    mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true});

    const usersSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
        },
        validated:{
            type: Boolean,
            default: false
        },
        emailValidationToken: {
            type: String,
            required: true
        },
        refreshToken: [String]

    }, {timestamps: true});

    const spacesSchema = new mongoose.Schema({
        spacename: {
            type: String,
            required: true
        },
        users: [{
            isAdmin:{
                type: Boolean,
                default: false
            },
            isDeleted:{
                type: Boolean,
                default: false
            },
        }],
        tasks: [{
            taskname: {
                type: String,
                required: true
            },
            points: {
                type: Number,
                required: true
            }
        }],
        activities: [{
            userId: {
                type: String,
                required: true
            },
            taskId: {
                type: String,
                required: true
            },
            taskname: {
                type: String,
                required: true
            },
            points: {
                type: Number,
                required: true
            },
            date: {
                type: Date,
                required: true
            },
            validated:{
                type: Boolean,
                default: false
            }
        }],
    }, {timestamps: true});

    mongoose.model('Users', usersSchema);
    mongoose.model('Spaces', spacesSchema);
    
}

module.exports = initDb;