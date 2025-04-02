const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

// Create email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Your email from .env
        pass: process.env.EMAIL_PASS   // Your email password from .env
    }
});

// Modified to accept direct parameters instead of req/res
const sendEmail = async (req, res) => {
    const { to, subject, text, html } = req.body;

    // Validate input
    if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ 
            message: 'Missing required fields: to, subject, and either text or html' 
        });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
};

// For API endpoint
const sendEmailHandler = async (req, res) => {
    try {
        await sendEmail(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to send email', 
            error: error.message 
        });
    }
};

module.exports = { sendEmail, sendEmailHandler };
