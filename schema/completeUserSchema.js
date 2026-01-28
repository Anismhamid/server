const Joi = require("joi");

const completeUserSchema = Joi.object({
	name: Joi.object({
		first: Joi.string().required(),
		last: Joi.string().allow(""),
	}),
	phone: Joi.object({
		phone_1: Joi.string()
			.pattern(/^0\d{1,2}-?\d{7}$/, "מספר טלפון לא תקין בפורמט ישראלי")
			.required()
			.messages({
				"string.pattern.base": "Phone number must be in a valid Israeli format",
			}),
		phone_2: Joi.string()
			.messages({
				"string.pattern.base": "Phone number must be in a valid Israeli format",
			})
			.allow(""),
	}),
	image: Joi.object({
		url: Joi.string()
			.messages({
				"string.pattern.base": "Phone number must be in a valid url format",
			})
			.allow(""),
	}),
	address: Joi.object({
		city: Joi.string().min(2).max(50).required(),
		street: Joi.string().min(2).max(50).required(),
		houseNumber: Joi.string().allow(""),
	}),
	gender: Joi.string().required(),
});

module.exports = completeUserSchema;
