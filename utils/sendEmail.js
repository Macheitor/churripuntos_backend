if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const {errLogger} = require('../middlewares/logger');


async function sendValidationEmail(user) {
    const validationLink = `${process.env.FRONTEND_HOST}/emails/${user._id}/token/${user.emailValidationToken}`
    const toEmail = (process.env.NODE_ENV === 'production' ? user.email : process.env.EMAIL_TO)
    
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

    
    // transporter.verify(function (error) {
    //   if (error) {
    //     console.log(error);
    //     errLogger(error);
    //   } else {
    //     console.log('Server validation done and ready for messages.');
    //   }
    // });
    
    const email = {
      from: `${process.env.EMAIL_FROM}`,
      to: toEmail,
      subject: 'Validate your email',
      html:  `
      <h2>Hi ${user.username},</h2>
      <h3>Thank you for register in CHURRIPUNTOS.</h3>
      <h3>Click on the button below to validate your account</h3>
      <button><a href=${validationLink}>Validate your email</a></button>   
      `,
    };

    try{
      await transporter.sendMail(email);
    } catch(err) {
      errLogger(err.message);
      throw new Error(`Sending email to ${err.rejected[0]} failed`);
    }

    return true 
}
  
  module.exports = {
  sendValidationEmail
};