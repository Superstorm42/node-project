const { check } = require('express-validator');

const config = {
	production: {
		SECRET: process.env.SECRET,
		DATABASE: process.env.MONGODB_URI,
		EMAIL_USER: process.env.EMAIL_USER,
		EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
	},
	default: {
		SECRET: 'j54O6D6i46T7or45dAk6S445un4eAklA435702',
		DATABASE: 'mongodb://localhost:27017/apartment_manager',
		EMAIL_USER: 'thorodinson4242@gmail.com',
		EMAIL_PASSWORD: 'Foysal16CSE',
	},
	test: {
		SECRET: 'j54O6D6i46T7or45dAk6S445un4eAklA435702',
		DATABASE: 'mongodb://localhost:27017/apartment_manager_test',
		EMAIL_USER: 'thorodinson4242@gmail.com',
		EMAIL_PASSWORD: 'Foysal16CSE',
	},
};

exports.get = function get(env) {
	return config[env] || config.default;
};
