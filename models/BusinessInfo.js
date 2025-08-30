const mongoose = require("mongoose");

const businessInfoSchema = new mongoose.Schema({
	deliveryFees: [
		{
			area: {type: String, required: true},
			fee: {type: Number, required: true},
		},
	],
	businessName: {type: String, required: true},
	businessSAddress: {type: String, required: true},
	businessPhone: {type: String, required: true},
});

const BusinessInfo = mongoose.model("BusinessInfo", businessInfoSchema);

module.exports = BusinessInfo;
