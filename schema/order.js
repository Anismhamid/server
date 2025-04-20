const productSchema = require("./product");
const Joi = require("joi");

const orderSchema = Joi.object({
	products: Joi.array().items(productSchema).min(1).required(),
	userId: Joi.string().required(),
	payment: Joi.boolean().required(),
	cashOnDelivery: Joi.boolean().required(),
	selfCollection: Joi.boolean().required(),
	delivery: Joi.boolean().required(),
	totalAmount: Joi.number(),
	deliveryFee: Joi.number(),
});
module.exports = orderSchema;
