const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 10, // The document will be automatically deleted after 10 minutes of its creation time
	},
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	// Create a transporter to send emails

	// Define the email options

	// Send the email
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
		console.log("Email sent successfully: ", mailResponse);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

// Define a pre-save hook to send email before the document has been saved
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});

// Let’s say in your route/controller:


// await new OTPModel({ email: "abc@example.com", otp: "123456" }).save();
// Then the flow is:

// Mongoose starts saving the document.

// The pre("save") hook runs:

// Detects it’s a new doc (this.isNew is true).

// Sends the verification email.

// After the email is sent, it calls next().

// The OTP is now saved in MongoDB.
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;

