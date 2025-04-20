const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
	userId: {type: String, required: true},
	orderNumber: {type: String, required: true},
	orderDate: {type: Date, default: Date.now},
	customer: {
		name: {
			first: {type: String},
			last: {type: String},
		},
		email: {type: String},
		phone: {
			phone_1: {type: String, required: true},
			phone_2: {type: String},
		},
		address: {
			city: {type: String},
			street: {type: String},
			houseNumber: {type: String},
		},
	},
	products: [
		{
			product_name: {type: String, required: true},
			quantity: {type: Number, default: 1},
			product_price: {type: Number, required: true},
		},
	],
	payment: {type: String, enum: [true, false], required: true},
	deliveryFee: {type: Number, default: 0},
	discount: {type: Number, default: 0},
	totalAmount: {type: Number, required: true},
	businessInfo: {
		name: {
			type: String,
			default: "שוק הפינה פירות ירקות ועוד",
		},
		companyId: {type: String},
		phone: {type: String},
		email: {type: String},
		address: {type: String},
	},
});

const Receipt = mongoose.model("receipts", receiptSchema);

module.exports = Receipt;
