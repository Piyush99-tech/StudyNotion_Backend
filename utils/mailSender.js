
// Import nodemailer for sending emails
const nodemailer = require("nodemailer");

// Load environment variables from .env file
require('dotenv').config();

/*
 * Sends an email using nodemailer.
 *
 * @param {string} email - Recipient's email address.
 * @param {string} title - Subject of the email.
 * @param {string} body - HTML content/body of the email.
 * @returns {Promise<object>} - Info object if sent successfully, or error object on failure.
 */
const mailSender = async (email, title, body) => {
    try {
        // Create a transporter object using SMTP transport configuration
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,      // e.g., "smtp.gmail.com"
            port: 587,                        // Port for TLS (587) or SSL (465)
            auth: {
                user: process.env.MAIL_USER,  // Your email address (sender)
                pass: process.env.MAIL_PASS,  // Your email password or app password
            }
        });

        // Define email options and content
        let info = await transporter.sendMail({
            from: `"Study Notion" <${process.env.MAIL_USER}>`, // Sender name and email
            to: `${email}`,                                     // Recipient email
            subject: `${title}`,                                // Email subject
            html: `${body}`,                                    // Email body as HTML
        });

        console.log("Email sent: ", info);
        return info;
    } catch (error) {
        console.log("Error sending email:", error.message);
        return error;
    }
};

// Export the mailSender function for use in other files
module.exports = mailSender;
