const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
	},
	products: [
		{
			product_name: {type: String, required: true},
			quantity: {type: Number, required: true, min: 1},
			product_price: {type: Number, required: true},
			product_image: {type: String, required: true},
			sale: {type: Boolean},
			discount: {
				type: Number,
			},
		},
	],
});

const Cart = mongoose.model("Carts", cartSchema);

module.exports = Cart;
