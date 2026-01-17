const Joi = require("joi");

const userSchema = Joi.object({
	name: Joi.object({
		first: Joi.string().min(3).max(50).required(),
		last: Joi.string().min(2).max(50).required(),
	}),
	slug: Joi.string().required(),
	phone: Joi.object({
		phone_1: Joi.string()
			.min(9)
			.max(10)
			.required()
			.pattern(/^0\d{1,2}-?\d{7}$/)
			.message({
				"string.pattern.base": "Phone number must be in a valid Israeli format",
			}),
		phone_2: Joi.string()
			.pattern(/^0\d{1,2}-?\d{7}$/)
			.message({
				"string.pattern.base": "Phone number must be in a valid Israeli format",
			})
			.allow(""),
	}),
	address: Joi.object({
		city: Joi.string().min(2).required(),
		street: Joi.string().min(2).required(),
		houseNumber: Joi.string().allow(""),
	}),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	gender: Joi.string().required(),
	image: Joi.object({
		url: Joi.string()
			.uri()
			.allow("")
			.default("https://cdn-icons-png.flaticon.com/512/64/64572.png"),
		alt: Joi.string().allow(""),
	}),
	role: Joi.string().valid("Admin", "Moderator", "Client").default("Client"),
	activity: Joi.array(),
	registrAt: Joi.string(),
	status: Joi.boolean(),
	terms: Joi.boolean().required(),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).max(60).required(),
});

module.exports = {userSchema, loginSchema};
