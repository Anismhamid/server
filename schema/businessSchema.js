const Joi = require("joi");

const businessSchema = Joi.object({
	deliveryFee: Joi.array()
		.of()
		.object({area: Joi.string().required(), fee: Joi.number().required()}),
	businessName: Joi.string().required(),
	businessSAddress: Joi.string().required(),
	businessPhone: Joi.string().required(),
});

module.exports = businessSchema;
