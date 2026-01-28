const Joi = require("joi");

const editUserProfileSchema = Joi.object({
	name: Joi.object({
		first: Joi.string().required(),
		last: Joi.string().allow("").optional(),
	}).required(),
	phone: Joi.object({
		phone_1: Joi.string()
			.pattern(/^0[2-9]\d{7,8}$/)
			.required(),
		phone_2: Joi.string()
			.pattern(/^0[2-9]\d{7,8}$/)
			.allow("")
			.optional(),
	}).required(),
	image: Joi.object({
		url: Joi.string().allow("").optional(),
		alt: Joi.string().allow("").optional(),
	}),
	address: Joi.object({
		city: Joi.string().required(),
		street: Joi.string().required(),
		houseNumber: Joi.string().allow("").optional(),
	}).required(),
	gender: Joi.string().valid("male", "female", "").allow("").optional(),
});

module.exports = editUserProfileSchema;
