const { User } = require('../models/userModel');
const { Apartment } = require('../models/apartmentModel');
exports.clearAll = async () => {
	await User.deleteMany({});
	await Apartment.deleteMany({});
};
exports.createUser = async (user) => {
	const user_ = new User(user);
	await user_.save();
	return user_._id;
};
exports.createApartment = async (apartment) => {
	const apartment_ = new Apartment(apartment);
	await apartment_.save();
	return apartment_._id;
};
