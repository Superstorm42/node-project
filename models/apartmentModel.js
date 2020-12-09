const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const apartmentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: 'Apartment name is required',
			minlength: 2,
			maxlength: 200,
		},
		description: {
			type: String,
			required: 'Apartment description is required',
			minlength: 2,
			max: 2000,
		},
		floorAreaSize: {
			type: Number,
			required: 'Apartment floor area size is required',
			min: 1,
			max: 10000000,
		},
		pricePerMonth: {
			type: Number,
			required: 'Apartment price per month is required',
			min: 1,
			max: 10000000,
		},
		numberOfRooms: {
			type: Number,
			required: 'Apartment number of month is required',
			min: 1,
			max: 10000000,
		},
		latitude: {
			type: Number,
			required: 'Apartment latitude is required',
			min: -90,
			max: 90,
		},
		longitude: {
			type: Number,
			required: 'Apartment longitude is required',
			min: -180,
			max: 180,
		},
		realtorId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		isAvailable: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{ timestamps: true }
);

apartmentSchema.plugin(aggregatePaginate);
const Apartment = mongoose.model('Apartment', apartmentSchema);
module.exports = { Apartment };
