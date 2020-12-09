const { Apartment } = require('../models/apartmentModel');
const limit_ = 25;

// @route GET api/apartment
// @desc Returns all apartments with pagination
exports.index = async function (req, res) {
	let aggregate_options = [];
	let isPublicPage = true;
	if (req.query.publicPage)
		isPublicPage = JSON.parse(req.query.publicPage.toLowerCase());
	const authUserType = req.user.userType;
	//PAGINATION

	let page = 1;
	let limit = limit_;
	if (req.query.page === 'all') {
		limit = await Apartment.countDocuments();
	} else {
		page = parseInt(req.query.page) || 1;
		limit = parseInt(req.query.limit) || limit_;
	}
	//set the options for pagination
	const options = {
		page,
		limit,
		collation: { locale: 'en' },
		customLabels: {
			totalDocs: 'totalResults',
			docs: 'apartments',
		},
	};

	//FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
	let match = {};

	// Apply filters on query
	let min_area = parseInt(req.query.min_area) || 0;
	let max_area = parseFloat(req.query.max_area) || 10000.0;
	let min_price = parseInt(req.query.min_price) || 0;
	let max_price = parseFloat(req.query.max_price) || 1000000.0;
	let min_rooms = parseInt(req.query.min_rooms) || 0;
	let max_rooms = parseInt(req.query.max_rooms) || 100;

	match.floorAreaSize = { $gte: min_area, $lt: max_area };
	match.pricePerMonth = { $gte: min_price, $lt: max_price };
	match.numberOfRooms = { $gte: min_rooms, $lt: max_rooms };

	if (req.query.name && req.query.name !== '')
		match.name = { $regex: req.query.name, $options: 'i' };
	if (isPublicPage) {
		if (authUserType === 'client') {
			match.isAvailable = true;
		}
	} else {
		if (authUserType === 'client') {
			match.isAvailable = true;
		}
		if (authUserType === 'realtor') {
			match.realtorId = req.user._id;
		}
	}
	aggregate_options.push({ $match: match });

	//GROUPING -- SECOND STAGE

	let sortOrder =
		req.query.sort_order && req.query.sort_order === 'desc' ? -1 : 1;
	if (req.query.sort_by === 'date')
		aggregate_options.push({ $sort: { createdAt: sortOrder } });
	else if (req.query.sort_by === 'area')
		aggregate_options.push({ $sort: { floorAreaSize: sortOrder } });
	else if (req.query.sort_by === 'rooms')
		aggregate_options.push({ $sort: { numberOfRooms: sortOrder } });
	else if (req.query.sort_by === 'price')
		aggregate_options.push({ $sort: { pricePerMonth: sortOrder } });
	else aggregate_options.push({ $sort: { createdAt: sortOrder } });
	// Set up the aggregation

	const myAggregate = Apartment.aggregate(aggregate_options);
	const result = await Apartment.aggregatePaginate(myAggregate, options);
	res.status(200).json({ success: true, ...result });
};

// @route POST api/apartment
// @desc Add a new apartment
exports.store = async (req, res) => {
	try {
		const newApartment = new Apartment(req.body);

		const apartment = await newApartment.save();
		res.status(200).json({
			success: true,
			apartment: apartment,
			message: 'Apartment added successfully',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @route GET api/apartment/{id}
// @desc Returns a specific apartment
exports.show = async function (req, res) {
	try {
		const apartmentId = req.params.apartmentId;

		const apartment = await Apartment.findById(
			apartmentId
		).populate('realtorId', { name: 1, email: 1, phone: 1 });
		if (!apartment)
			return res
				.status(401)
				.json({ success: false, message: 'Apartment does not exist' });
		if (!apartment.isAvailable && req.user.userType === 'client') {
			return res.status(401).json({
				success: false,
				message: 'Apartment is not available',
			});
		}
		res.status(200).json({ success: true, apartment });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @route PUT api/apartments/{id}
// @desc Update apartment details
exports.update = async function (req, res) {
	try {
		let update = req.body;
		let id = req.params.apartmentId;

		const userId = req.user._id;
		if (req.user.userType === 'realtor') {
			delete update.realtorId;
			delete update.createdBy;
		}

		const apartment = await Apartment.findOneAndUpdate(
			{ _id: id },
			{ $set: update },
			{ new: true }
		);

		if (!apartment)
			return res.status(401).json({
				success: false,
				message: 'Apartment does not exist',
			});

		res.status(200).json({
			apartment: apartment,
			success: true,
			message: 'Apartment has been updated',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @route DESTROY api/apartment/{id}
// @desc Delete Apartment
// @access Public
exports.destroy = async function (req, res) {
	try {
		const id = req.params.apartmentId;
		const apartment = await Apartment.findOneAndDelete({ _id: id });

		if (!apartment)
			return res.status(404).json({
				success: false,
				message:
					"Apartment does not exist or you don't have the required permission.",
			});

		res.status(200).json({
			success: true,
			message: 'Apartment has been deleted',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
