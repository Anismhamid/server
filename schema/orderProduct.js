const Joi = require("joi");

const productSchema = Joi.object({
	product_name: Joi.string().required(),
	product_image: Joi.string().uri().optional(),
	product_price: Joi.number().positive().required(),
	quantity: Joi.number().integer().min(1).required(),
	sale: Joi.boolean(),
	discount: Joi.number(),
});

module.exports = productSchema;
