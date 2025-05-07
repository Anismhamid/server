const Joi = require("joi");

const businessSchema = Joi.object({
	deliveryFee: Joi.number(),
	businessName: Joi.string().required(),
	businessSAddress: Joi.string().required(),
	businessPhone: Joi.string().required(),
});

module.exports = businessSchema;