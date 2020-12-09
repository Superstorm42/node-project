const apartment = require('express').Router();
const ApartmentController = require('../controllers/apartmentController');
const { Apartment } = require('../models/apartmentModel');
const {
	createApartment,
} = require('../middlewares/validators/apartmentValidator');
const {
	grantAccess,
	allowIfLoggedin,
} = require('../middlewares/accessControl');
const validate = require('../middlewares/validators/validate');

//Index
apartment.get('/', allowIfLoggedin, ApartmentController.index);

//STORE
apartment.post(
	'/',
	createApartment,
	validate,
	allowIfLoggedin,
	grantAccess('create', 'apartment'),
	ApartmentController.store
);

//SHOW
apartment.get('/:apartmentId', allowIfLoggedin, ApartmentController.show);

//UPDATE
apartment.put(
	'/:apartmentId',
	createApartment,
	validate,
	allowIfLoggedin,
	grantAccess('update', 'apartment'),
	ApartmentController.update
);

//DELETE
apartment.delete(
	'/:apartmentId',
	allowIfLoggedin,
	grantAccess('delete', 'apartment'),
	ApartmentController.destroy
);

module.exports = apartment;
