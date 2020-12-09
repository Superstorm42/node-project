const user = require('express').Router();
const UserController = require('../controllers/userController');
const userValidation = require('../middlewares/validators/userValidator');
const validate = require('../middlewares/validators/validate');
const {
	grantAccess,
	allowIfLoggedin,
} = require('../middlewares/accessControl');

// Check if email exist on user table
user.get('/email/:email', UserController.checkEmailExist);

// Get all users
// Client and realtor are not able to use this api
// Admin are able to use this to get client and realtor user by adding userType = 'client' / userType = 'realtor' / userType = 'all'
user.get(
	'/',
	allowIfLoggedin,
	grantAccess('read', 'user'),
	UserController.index
);

// Get one user
// Client and Realtor are able to get only their own user model.
// Admin are able to get both client and realtor user model
user.get(
	'/:userId',
	allowIfLoggedin,
	grantAccess('read', 'user'),
	UserController.show
);

// Create One user
// Only Admin can create a new user.
user.post(
	'/',
	userValidation.setUser,
	validate,
	allowIfLoggedin,
	grantAccess('create', 'user'),
	UserController.store
);

// Update One user
// Client and realtor can update themselves only.
// Only Admin can update all users.
user.put(
	'/:userId',
	userValidation.setUser,
	validate,
	allowIfLoggedin,
	grantAccess('update', 'user'),
	UserController.update
);

// Delete One user
// Only Admin can delete a user(except himself)
user.delete(
	'/:userId',
	allowIfLoggedin,
	grantAccess('delete', 'user'),
	UserController.destroy
);

module.exports = user;
