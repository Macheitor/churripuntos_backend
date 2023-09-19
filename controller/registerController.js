if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const bcrypt = require('bcrypt');
const Users = require('mongoose').model('Users');
const {errLogger} = require('../middlewares/logger');


function sendValidationEmail(user) {

    const validationLink = `${process.env.HOST}:${process.env.PORT}/emailValidation/${user._id}/token/${user.emailValidationToken}`

    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
        host: `${process.env.EMAIL_HOST}`,
        port: `${process.env.EMAIL_PORT}`,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: `${process.env.EMAIL_USER}`,
          pass: `${process.env.EMAIL_PASS}`,
        },
      });
    transporter.verify(function (error, success) {
        if(error) {
            console.log(error);
        } else {
            console.log('Server validation done and ready for messages.')
        }
    });
    const email = {
        from: `${process.env.EMAIL_FROM}`,
        // to: `${user.email}`,
        to: `victor.machado.perez@gmail.com`,
        subject: 'Validate your email',
        // text: 'Click next link to validate your email: <a href="https://www.semrush.com/">Visit Semrush!</a>'
        html:  `
        <h3>Thank you for register in CHURRIPUNTOS.</h3>
        <h3>Click on the button below to validate your account</h3>
        <button><a href=${validationLink}>Validate your email</a></button>   
      `,
    };

    transporter.sendMail(email, function(error, success){
        if (error) {
            console.log(error);
        } else {
            console.log('Nodemailer Email sent: ' + success.response);
        }
    });

}

async function registerUser(req, res) {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        if (!username) return res.status(400).send({status: 'fail', message: 'username not provided'});
        if (!email) return res.status(400).send({status: 'fail', message: 'email not provided'});
        if (!password) return res.status(400).send({ status: "fail", message: `password not provided`});

        const userExists = await Users.findOne({email});

        if (userExists) {
            return res.status(400).send({ status: "fail", message: `email already registered`});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const currentDate = new Date().getTime();
        const random = require('crypto').randomBytes(16).toString('hex')
        const emailValidationToken = currentDate + random

        const user = await Users.create({ username, email, password: hashedPassword, emailValidationToken });
        // TODO: Check user has been created properly

        sendValidationEmail(user)

        res.sendStatus(201);
        
    } catch(err) {
        const error = { status: 'error', message: `${err.name}: ${err.message}` }; 
        res.status(500).send(error);
        errLogger(error.message);
    }
}

module.exports = {
    registerUser
};