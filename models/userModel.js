const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);
const SALT_I = 10;
const crypto = require('crypto');
const userSchema = mongoose.Schema(
	{
		name: { type: String, required: true },
		phone: { type: String },
		email: { type: String, unique: true, required: true, index: true },
		password: { type: String },
		userType: {
			type: String,
			default: 'client',
			enum: ['client', 'realtor', 'admin'],
		},
		token: { type: String },
		resetPasswordToken: {
			type: String,
			required: false,
		},
		resetPasswordExpires: {
			type: Date,
			required: false,
		},
	},
	{ timestamps: true }
);

userSchema.pre('save', function (next) {
	var user = this;
	if (user.isModified('password')) {
		bcrypt.genSalt(SALT_I, function (err, salt) {
			if (err) {
				return next(err);
			}

			bcrypt.hash(user.password, salt, function (err, hash) {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});

userSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateToken = function (cb) {
	var user = this;
	var token = jwt.sign(
		{
			id: user._id.toHexString(),
			email: user.email,
		},
		config.SECRET,
		{ expiresIn: '72h' }
	);
	user.token = token;
	user.save(function (err, user) {
		if (err) return cb(err);
		cb(null, user);
	});
};

userSchema.statics.findByToken = function (token, cb) {
	var user = this;
	jwt.verify(token, config.SECRET, function (err, decode) {
		if (decode == undefined) {
			cb(null, null);
		} else {
			user.findOne({ _id: decode.id, token: token }, function (
				err,
				user
			) {
				if (err) return cb(err);
				cb(null, user);
			});
		}
	});
};

userSchema.methods.deleteToken = function (token, cb) {
	var user = this;
	user.updateOne({ $unset: { token: 1 } }, (err, user) => {
		if (err) return cb(err);
		cb(null, user);
	});
};

userSchema.methods.generatePasswordReset = function () {
	this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

const User = mongoose.model('User', userSchema);
module.exports = { User };
