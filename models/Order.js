const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		orderNumber: {
			type: String,
			required: true,
			unique: true,
		},

		products: [
			{
				product_name: {
					type: String,
					required: true,
				},
				product_image: {
					type: String,
				},
				product_price: {
					type: Number,
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
				},
				sale: {type: Boolean, default: false},
				discount: {
					type: Number,
					default: 0,
				},
			},
		],
		payment: {type: Boolean, required: true},
		cashOnDelivery: {type: Boolean},
		selfCollection: {type: Boolean, required: true},
		delivery: {type: Boolean, required: true},
		deliveryFee: {type: Number},
		status: {
			type: String,
			enum: ["Pending", "Preparing", "Delivered", "Shipped", "Cancelled"],
			default: "Pending",
		},
		date: {
			type: Date,
			default: Date.now,
		},
		totalAmount: {
			type: Number,
			required: true,
		},
	},
	{timestamps: true},
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
