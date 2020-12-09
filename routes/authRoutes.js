const auth = require('express').Router();
const AuthController = require('../controllers/authController');
const PasswordController = require('../controllers/passwordController');
const UserValidation = require('../middlewares/validators/userValidator');
const validate = require('../middlewares/validators/validate');

const {
	allowIfLoggedin,
	grantAccess,
} = require('../middlewares/accessControl');

// API to create admin for the first time
// AKA SEED
auth.post('/seed', UserValidation.ValidEmail, validate, AuthController.seed);

// API to check if user is authenticated using cookies token
auth.get('/', allowIfLoggedin, AuthController.checkAuth);

// Open API to sign up into the system
auth.post(
	'/signup',
	UserValidation.userSignUp,
	validate,
	AuthController.signUp
);

// Open API to sign in into the system
auth.post(
	'/signin',
	UserValidation.userSignIn,
	validate,
	AuthController.signIn
);

// Open API to sign out from the system
auth.post('/signout', allowIfLoggedin, AuthController.signOut);

// API to change user password
auth.put(
	'/:userId/password',
	UserValidation.updatePassword,
	validate,
	allowIfLoggedin,
	grantAccess('update', 'password'),
	AuthController.updatePassword
);

// API to recover user password using email
auth.post(
	'/recover',
	UserValidation.ValidEmail,
	validate,
	PasswordController.recover
);

// API to reset user password which was requested for recovery
auth.post(
	'/:userId/reset/:token',
	UserValidation.PasswordReset,
	validate,
	PasswordController.resetPassword
);

module.exports = auth;
