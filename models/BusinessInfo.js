const mongoose = require("mongoose");

const businessInfoSchema = new mongoose.Schema({
	deliveryFee: {type: Number, default: 0},
	businessName: {type: String, required: true},
	businessSAddress: {type: String, required: true},
	businessPhone: {type: String, required: true},
});

const BusinessInfo = mongoose.model("BusinessInfo", businessInfoSchema);

module.exports = BusinessInfo;
