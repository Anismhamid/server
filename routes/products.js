const express = require("express");
const router = express.Router();
const Products = require("../models/Product");
const auth = require("../middlewares/auth");
const productsSchema = require("../schema/productsSchema");

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
// Create new product
router.post("/", auth, async (req, res) => {
	try {
		// Authorization (إن أردت)
		if (!["Admin", "Moderator", "Vendor"].includes(req.payload.role)) {
			return res.status(403).send("Access denied");
		}

		// Validate body
		const { error } = productsSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// Prevent duplicate product for same seller
		const existingProduct = await Products.findOne({
			product_name: req.body.product_name,
			"seller.slug": req.payload.slug,
		});

		if (existingProduct) {
			return res.status(400).send("Product already exists for this seller");
		}

		// Build seller from token ONLY
		const seller = {
			name: req.payload.name.first,
			slug: req.payload.slug,
			user: req.payload._id,
		};

		// Create product safely
		const product = new Products({
			...req.body,
			seller,
		});

		await product.save();

		// Emit socket event
		const io = req.app.get("io");
		io.emit("product:new", product);

		res.status(201).send(product);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Post to create a new product
router.post("/", auth, async (req, res) => {
	try {
		// if (
		// 	!req.payload ||
		// 	(req.payload.role !== "Admin" && req.payload.role !== "Moderator")
		// ) {
		// 	return res.status(401).send("Unauthorized");
		// }

		const {error} = productsSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// Check if product already exists
		let product = await Products.findById({_id: req.body._id});

		if (product) return res.status(400).send("The product already exists");

		// Create a new product using the data from the request body
		const seller = {
			name: req.payload.name.first,
			slug: req.payload.slug,
			user: req.payload,
		};

		product = new Products({
			...req.body,
			seller,
		});

		// Save the new product to the database
		await product.save();

		const io = req.app.get("io");
		io.emit("product:new", product);

		// Send the created product back in the response
		res.status(201).send(product);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Get spicific product by name
router.get("/spicific/:productId", async (req, res) => {
	try {
		// Find the product by product_name
		const product = await Products.findById(req.params.productId);

		if (!product) return res.status(404).send("Product not found");

		// Return the found product
		res.status(200).send(product);
	} catch (error) {
		res.status(500).send(error);
	}
});

// Update product
router.put("/:productId", auth, async (req, res) => {
	try {
		// 1️⃣ تحقق من وجود المنتج
		const product = await Products.findById(req.params.productId);
		if (!product) return res.status(404).send("Product not found");

		if (req.payload.slug !== product.seller.slug)
			return res.status(403).send("Access denied. You can't update this product");

		const {error} = productsSchema.validate(req.body, {
			allowUnknown: false,
			abortEarly: true,
		});
		if (error) return res.status(400).send(error.details[0].message);

		// 4️⃣ منع تحديث بيانات حساسة
		delete req.body.seller;
		delete req.body.likes;

		// 5️⃣ تحديث المنتج
		const updatedProduct = await Products.findByIdAndUpdate(
			req.params.productId,
			{$set: req.body},
			{new: true, runValidators: true},
		);

		res.status(200).send(updatedProduct);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

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

router.get("/customer/:slug", async (req, res) => {
	try {
		const {slug} = req.params;

		const products = await Products.find({"seller.slug": slug});
		if (!products || products.length === 0)
			return res.status(404).send("No products for this user");

		res.status(200).send(products);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

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

// ----- Like / Unlike a product -----
// PATCH /api/products/:productId/like
router.patch("/:productId/like", auth, async (req, res) => {
	try {
		const {productId} = req.params;
		const userId = req.payload._id;

		const product = await Products.findById(productId);
		if (!product) return res.status(404).send({message: "Product not found"});

		// Check if user already liked the product
		const alreadyLiked = product.likes.includes(userId);

		if (alreadyLiked) {
			// Remove like (unlike)
			product.likes = product.likes.filter((id) => id !== userId);
		} else {
			// Add like
			product.likes.push(userId);
		}

		await product.save();

		res.status(200).send({
			productId: product._id,
			liked: !alreadyLiked,
			totalLikes: product.likes.length,
		});
	} catch (error) {
		console.error("Like error:", error);
		res.status(500).send({message: "Internal server error"});
	}
});

module.exports = router;
