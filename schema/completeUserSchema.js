const Joi = require("joi");

const completeUserSchema = Joi.object({
	phone: Joi.object({
		phone_1: Joi.string()
			.pattern(/^0\d{1,2}-?\d{7}$/)
			.required()
			.messages({
				"string.pattern.base": "Phone number must be in a valid Israeli format",
			}),
		phone_2: Joi.string()
			.allow("")
			.messages({
				"string.pattern.base": "Phone number must be in a valid Israeli format",
			}),
	}),
	address: Joi.object({
		city: Joi.string().min(2).max(50).required(),
		street: Joi.string().min(2).max(50).required(),
		houseNumber: Joi.string(),
	}),
});

module.exports = completeUserSchema;
