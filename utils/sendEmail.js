//this has to be updated
const nodemailer = require("nodemailer");
require("dotenv").config(); //environment variables

// email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  //  email from .env
        pass: process.env.EMAIL_PASS   //  password from .env
    }
});

/**
 * Send email function
 * @param {string} to - Receiver's email
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 */
const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendEmail;
