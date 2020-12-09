const { check } = require('express-validator');

// Validation of user
exports.createApartment = [
	check('name')
		.isLength({ max: 200, min: 2 })
		.not()
		.isEmpty()
		.withMessage(
			'Apartment name is required and length should be between 2 to 200 characters.'
		),
	check('description')
		.isLength({ max: 2000, min: 2 })
		.not()
		.isEmpty()
		.withMessage(
			'Apartment description is required and length should be between 2 to 2000 characters.'
		),
	check('floorAreaSize')
		.isNumeric({ min: 1, max: 10000 })
		.not()
		.isEmpty()
		.withMessage(
			'Floor area size is required and should be between 1 to 10000 ( square feet).'
		),
	check('pricePerMonth')
		.isNumeric({ min: 1, max: 1000000 })
		.not()
		.isEmpty()
		.withMessage(
			'Price Per Month is required and should be between 1 to 1000000 (USD).'
		),
	check('numberOfRooms')
		.isNumeric({ min: 1, max: 100 })
		.not()
		.isEmpty()
		.withMessage(
			'Number of rooms is required and should be between 1 to 100.'
		),
	check('latitude')
		.isNumeric({ min: -90, max: 90 })
		.not()
		.isEmpty()
		.withMessage('Latitude is required and should be between -90 to 90.'),
	check('longitude')
		.isNumeric({ min: -180, max: 180 })
		.not()
		.isEmpty()
		.withMessage(
			'Longitude is required and should be between -180 to 180.'
		),
	check('isAvailable')
		.isBoolean()
		.not()
		.isEmpty()
		.withMessage('Flat status(available or rented) is missing.'),
];
