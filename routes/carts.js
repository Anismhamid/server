const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();
const Product = require("../models/Product");
const Carts = require("../models/Cart");
const Joi = require("joi");

const cartSchema = Joi.object({
	userId: Joi.string(),
	product_name: Joi.string().required(),
	quantity: Joi.number().min(1).required(),
	product_price: Joi.number().required(),
	product_image: Joi.string().required(),
	sale: Joi.boolean().required(),
	discount: Joi.number().required(),
});

// Add product to cart by name
router.post("/", auth, async (req, res) => {
	try {
		// Validate body
		const {error} = cartSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// Check if the product exists
		let product = await Product.findOne({product_name: req.body.product_name});
		if (!product) return res.status(404).send("This product is not available");

		// Find or create the user's cart
		let cart = await Carts.findOne({userId: req.payload._id});

		if (!cart) {
			cart = new Carts({
				userId: req.payload._id,
				products: [
					{
						product_name: req.body.product_name,
						quantity: req.body.quantity,
						product_price: req.body.product_price * req.body.quantity,
						product_image: req.body.product_image,
						sale: req.body.sale,
						discount: req.body.discount,
					},
				],
			});
			await cart.save();
		} else {
			// If cart exists, find the product in the cart
			const productInCart = cart.products.find(
				(item) => item.product_name === req.body.product_name,
			);

			if (productInCart) {
				// Update product quantity and price if it exists in the cart
				productInCart.quantity += req.body.quantity;
				productInCart.product_price =
					productInCart.quantity * req.body.product_price;
			} else {
				cart.products.push({
					product_name: req.body.product_name,
					quantity: req.body.quantity,
					product_price: req.body.product_price * req.body.quantity,
					product_image: req.body.product_image,
					sale: req.body.sale,
					discount: req.body.discount,
				});
			}
			await cart.save();
		}

		// Update the product stock
		product = await Product.findOneAndUpdate(
			{product_name: req.body.product_name},
			{$inc: {quantity_in_stock: -req.body.quantity}},
			{new: true},
		);

		res.status(200).send("Product added to cart successfully");
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// get spicific user cart
router.get("/my-cart", auth, async (req, res) => {
	try {
		// Find the cart for the specific user by userId
		const cart = await Carts.find({userId: req.payload._id});
		if (!cart) return res.status(404).send("Cart not found"); // More meaningful error message

		res.status(200).send(cart);
	} catch (error) {
		res.status(400).send(error);
	}
});

// get carts for admin users
router.get("/admin", auth, async (req, res) => {
	try {
		if (req.payload.role !== "Admin") return res.status(401).send("just for admin");

		// Find all the the carts for admin user
		const carts = await Carts.find();

		// If no cart found, return a 404 error
		if (!carts) return res.status(404).send("Cart not found"); // More meaningful error message

		// Successfully return the cart
		res.status(200).send(carts);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

router.delete("/:product_name", auth, async (req, res) => {
	try {
		const userId = req.payload._id;
		// Ensure the user is authenticated

		// Find the cart for the authenticated user (assuming the user can only delete from their own cart)
		const cart = await Carts.findOne({userId: req.payload._id, userId: userId});
		if (!cart) return res.status(404).send("Cart not found");
		if (userId !== cart.userId) return res.status(403).send("User not authenticated");

		// Find the product index in cart products array
		const productIndex = cart.products.findIndex(
			(product) => product.product_name === req.params.product_name,
		);
		if (productIndex === -1) return res.status(404).send("Product not found in cart");

		// Remove the product from the cart
		cart.products.splice(productIndex, 1);

		// Save the cart after removing the product
		await cart.save();

		// Send a successful response
		res.status(200).send("Product removed from cart successfully");
	} catch (error) {
		res.status(400).send("Server error");
	}
});

module.exports = router;
