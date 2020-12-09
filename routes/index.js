const routes = require('express').Router();
const user = require('./userRoutes');
const apartment = require('./apartmentRoutes');
const auth = require('./authRoutes');
const test = require('./testRoutes');

routes.use('/users', user);
routes.use('/apartments', apartment);
routes.use('/auth', auth);
routes.use('/test', test);
const connected = {
	success: true,
	version: '1.0.0',
};
routes.get('/', (req, res) => {
	res.status(200).send(connected);
});

module.exports = routes;
