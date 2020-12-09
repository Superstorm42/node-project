const config = require('../config/config').get(process.env.NODE_ENV);

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: config.EMAIL_USER,
		pass: config.EMAIL_PASSWORD,
	},
});

exports.sendMailToUser = (recieverEmail, mailSubject, mailBody) => {
	var mailOptions = {
		from: config.EMAIL_USER,
		to: recieverEmail,
		subject: mailSubject,
		html: mailBody,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) return error;
		return info;
	});
};
