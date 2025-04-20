const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema(
	{
		product_name: {type: String, unique: true, required: true, trim: true},
		category: {type: String, required: true},
		price: {
			type: Number,
			required: true,
			min: [1, "Price must be a positive number"],
		},
		quantity_in_stock: {
			type: Number,
			required: true,
			min: 1,
		},
		description: {
			type: String,
			required: true,
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		image_url: {
			type: String,
			required: true,
		},
		sale: {type: Boolean, required: true, default: false},
		discount: {type: Number},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
		__v: {type: Number},
	},
	{
		timestamps: true,
	},
);

const Products = mongoose.model("Products", productsSchema);

module.exports = Products;
