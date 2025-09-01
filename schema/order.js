const productSchema = require("../schema/orderProduct");
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
	phone: Joi.object({
		phone_1: Joi.string().required(),
		phone_2: Joi.string().allow(""),
	}),
	address: Joi.object({
		city: Joi.string().required(),
		street: Joi.string().required(),
		houseNumber: Joi.string().required(),
	}),
});
module.exports = orderSchema;
