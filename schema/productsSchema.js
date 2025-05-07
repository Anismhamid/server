const Joi = require("joi");

const productsSchema = Joi.object({
	product_name: Joi.string().min(3).max(50).required().trim(),
	category: Joi.string().required().min(2).max(50),
	price: Joi.number().positive().required().min(0),
	quantity_in_stock: Joi.number().required().min(1),
	description: Joi.string().max(500).required(),
	image_url: Joi.string().uri().allow(""),
	sale: Joi.boolean().default(false),
	discount: Joi.number(),
});

module.exports = productsSchema;
