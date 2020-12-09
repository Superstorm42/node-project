const { User } = require('../models/userModel');
const { use } = require('chai');

// Path = (post)'/api/auth/seed/{email}'
// Task = Creates First admin to manage the site.
exports.seed = async (req, res) => {
	let user = {
		email: req.body.email.toLowerCase(),
		name: 'admin',
		password: 'admin123',
		userType: 'admin',
	};
	const countUsers = await User.countDocuments({ userType: 'admin' });
	if (countUsers === 0) {
		let firstUser = new User(user);
		let firstUser_ = await firstUser.save();
		if (!firstUser_)
			res.status(400).send({
				success: false,
				message: 'Seed not working, check your email',
			});
		else
			res.status(200).send({
				success: true,
				message:
					'Admin created, change your Name and password from system',
			});
	} else {
		res.status(400).send({
			success: false,
			message: 'Already does have some user.',
		});
	}
};

// Path = (post)'/api/auth/signup'
// Task = Creates a new user.
exports.signUp = async (req, res) => {
	try {
		let user = req.body;
		user.email = user.email.toLowerCase();
		if (user) {
			const email = user.email.toLowerCase();
			const foundUser = await User.findOne({ email });
			if (foundUser) {
				return res.status(401).json({
					success: false,
					message:
						'The email address you have entered is already associated with another account.',
				});
			}
		}
		const newUser = new User(user);
		const user_ = await newUser.save();
		user_.generateToken((err, user) => {
			if (err)
				return res.status(401).json({ message: 'Invalid user data' });
			else
				return res.cookie('userAuthToken', user.token).json({
					success: true,
					isAuth: true,
				});
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Path = (post)'/api/auth/signin'
// Task = sign in an user.
exports.signIn = async (req, res) => {
	try {
		let { email, password } = req.body;
		email = email.toLowerCase();
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).json({
				success: false,
				isAuth: false,
				message: 'No user found with this email',
			});
		}
		if (!user.comparePassword(password))
			return res.status(401).json({
				success: false,
				isAuth: false,
				message: 'Invalid email or password',
			});
		const user_ = (({ _id, name, userType }) => ({ _id, name, userType }))(
			user
		);

		user.generateToken((err, user) => {
			if (err)
				return res.status(401).json({ message: 'Invalid user data' });
			else
				return res.cookie('userAuthToken', user.token).json({
					success: true,
					isAuth: true,
					user: user_,
				});
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Path = (get)'/api/auth'
// Task = Checks if user is signed in.
exports.checkAuth = async (req, res) => {
	const user = (({ _id, name, userType, email, phone }) => ({
		_id,
		name,
		userType,
		email,
		phone,
	}))(req.user);
	res.status(200).send({
		isAuth: true,
		user,
	});
};

// Path = (get)'/api/auth/signout'
// Task = sign out an user.
exports.signOut = async (req, res) => {
	req.user.deleteToken(req.token, (err, user) => {
		if (err) return res.status(400).send({ success: false, err });
		res.clearCookie('userAuthToken').status(200).json({
			isAuth: false,
			message: 'Signed out from the system',
		});
	});
};

// Path = (put)'/api/auth/:userId/password'
// Task = changes user's password.
exports.updatePassword = async (req, res) => {
	try {
		const { password, oldPassword } = req.body;

		const userId = req.params.userId;
		const user = await User.findOne({ _id: userId });

		if (!user.comparePassword(oldPassword)) {
			return res.status(401).json({
				success: false,
				message: 'Invalid old password',
			});
		}
		user.password = password;
		const user_ = await user.save();

		res.status(200).send({
			success: true,
			message: 'Password changed successfully.',
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
