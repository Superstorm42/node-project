const { User } = require('../models/userModel');
const { sendMailToUser } = require('../utils/emailManager');

// @route POST api/auth/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
exports.recover = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user)
			return res.status(404).json({
				success: false,
				message:
					'The email address, ' +
					req.body.email +
					' is not associated with any account. Double-check your email address and try again.',
			});

		user.generatePasswordReset();

		// Save the updated user object
		await user.save();

		// send email
		let subject = 'Password change request';
		let to = user.email;
		let link =
			'http://' +
			req.headers.host +
			'/user/' +
			user._id +
			'/reset/' +
			user.resetPasswordToken;
		let html = `<p>Hi ${user.name},</p>
                    <p>Please click on the following <a href="${link}">link</a> to reset your password.</p> 
                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

		await sendMailToUser(to, subject, html);

		res.status(200).json({
			success: true,
			message: 'A reset email has been sent to ' + user.email + '.',
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route POST api/auth/reset
// @desc Reset Password
// @access Public
exports.resetPassword = async (req, res) => {
	try {
		const { userId, token } = req.params;
		const user = await User.findOne({
			_id: userId,
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user)
			return res.status(401).json({
				succes: false,
				message: 'Password reset token is invalid or has expired.',
			});

		//Set the new password
		user.password = req.body.password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;

		// Save the updated user object
		await user.save();

		let subject = 'Your password has been changed';
		let to = user.email;

		let html = `<p>Hi ${user.name}</p>
                    <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`;

		await sendMailToUser(to, subject, html);

		res.status(200).json({
			success: true,
			message: 'Your password has been updated.',
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
