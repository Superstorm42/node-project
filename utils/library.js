exports.createValidationErrorMessage = (errors) => {
	let errorMessage = [];
	for (let err = 0; err < errors.length; err++) {
		errorMessage.push(errors[err].param + ' -> ' + errors[err].msg);
	}
	return errorMessage;
};
