const Joi = require("joi");

const cartSchema = Joi.object({
	userId: Joi.string(),
	product_name: Joi.string().required(),
	quantity: Joi.number().min(1).required(),
	product_price: Joi.number().required(),
	product_image: Joi.string().required(),
	sale: Joi.boolean().required(),
	discount: Joi.number().required(),
});

module.exports = cartSchema;
