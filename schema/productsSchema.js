const Joi = require("joi");
const {userSchema} = require("./userSchema");

const productsSchema = Joi.object({
	seller: Joi.object({
		name: Joi.string().required(),
		slug: Joi.string(),
		user: userSchema,
	}),

	// if the product is car
	brand: Joi.string().allow(""),
	year: Joi.string().allow(""),
	fuel: Joi.string().allow(""),
	mileage: Joi.number().min(0).allow(null),
	color: Joi.string().allow(""),

	product_name: Joi.string().min(2).max(50).required().trim(),
	category: Joi.string().required().min(2).max(50),
	price: Joi.number().positive().required(),
	in_stock: Joi.boolean().default(true),

	description: Joi.string().max(500).allow(""),
	image_url: Joi.string().uri().allow(""),
	likes: Joi.array().items(Joi.string()).default([]),

	sale: Joi.boolean().default(false),
	discount: Joi.number().min(0).max(100),
});

module.exports = productsSchema;
