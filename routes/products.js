const express = require("express");
const router = express.Router();
const Products = require("../models/Product");
const auth = require("../middlewares/auth");
const Joi = require("joi");

const productsSchema = Joi.object({
	product_name: Joi.string().min(3).max(50).required().trim(),
	category: Joi.string().required().min(2).max(50),
	price: Joi.number().positive().required().min(0),
	quantity_in_stock: Joi.number().required().min(1),
	description: Joi.string().max(500).required(),
	image_url: Joi.string().uri().allow(""),
	sale: Joi.boolean().default(false),
	discount: Joi.number(),
});

//==============All-products==========
// Get all products for search in home page
router.get("/", async (req, res) => {
	try {
		// find the products
		const products = await Products.find();
		if (!products) return res.status(404).send("No products to provide");
		res.status(200).send(products);
	} catch (error) {
		res.status(500).json({"Internal server error": error.message});
	}
});

// Post to create a new product
router.post("/", auth, async (req, res) => {
	try {
		if (
			!req.payload ||
			(req.payload.role !== "Admin" && req.payload.role !== "Moderator")
		) {
			return res.status(401).send("Unauthorized");
		}

		const {error} = productsSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// Check if product already exists
		let product = await Products.findOne({product_name: req.body.product_name});

		if (product) return res.status(400).send("The product already exists");

		// Create a new product using the data from the request body
		product = new Products(req.body);

		// Save the new product to the database
		await product.save();

		// Send the created product back in the response
		res.status(201).send(product);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Get spicific product by name
router.get("/spicific/:name", auth, async (req, res) => {
	try {
		// Check if the user has permission to access the product
		if (req.payload.role !== "Admin" && req.payload.role !== "Moderator")
			return res.status(401).send("Access denied.");

		// Find the product by product_name
		const product = await Products.findOne({
			product_name: req.params.name,
		});

		if (!product) return res.status(404).send("Product not found");

		// Return the found product
		res.status(200).send(product);
	} catch (error) {
		res.status(500).send(error);
	}
});

// Put product
router.put("/:productName", auth, async (req, res) => {
	try {
		// Check if the user has permission to access the product
		if (req.payload.role !== "Admin" && req.payload.role !== "Moderator")
			return res.status(401).send("Access denied. no toke provided");

		// validate body
		const {error} = productsSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// check if product exists
		const productToUpdate = await Products.findOneAndUpdate(
			{
				product_name: req.params.productName,
			},
			{...req.body},
			{new: true},
		);
		if (!productToUpdate) return res.status(404).send("This Product is not exists");

		res.status(200).send(productToUpdate);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Patch product

// Delete product
router.delete("/:name", auth, async (req, res) => {
	try {
		if (req.payload.role !== "Admin" && req.payload.role !== "Moderator")
			return res.status(401).send("Access denied. no token provided");

		// Find the produc and delete
		const productToDelete = await Products.findOneAndDelete({
			product_name: req.params.name,
		});
		if (!productToDelete) res.status(404).send("This product is not found");

		res.status(200).send("The product has been deleted");
	} catch (error) {
		res.status(500).send(error.message);
	}
});
//______________End-All-products__________

router.get("/:category", async (req, res) => {
	try {
		const category = req.params.category;
		const product = await Products.find({
			category: category.charAt(0).toUpperCase() + category.slice(1),
		});

		if (product.length === 0) return res.status(404).send(`${category} not found`);

		res.status(200).send(product);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
