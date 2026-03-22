const express = require("express");

const router = express.Router();
const Products = require("../models/Product");
const auth = require("../middlewares/auth");
const {getProductSchema} = require("../schema/productsSchema");
const cloudinary = require("../config/cloudinary");

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

// Post new product
router.post("/", auth, async (req, res) => {
	try {
		const {category, type, ...productData} = req.body;

		// get category and subcategory schema
		const schema = getProductSchema(category, type);

		// Add type and category to the data if they are not already exiests		const dataToValidate = {
		const dataToValidate = {
			...productData,
			category,
			type,
		};
		console.log(dataToValidate);
		// validate schema
		const {error} = await schema.validate(dataToValidate);

		// if error return the error
		if (error) return res.status(400).send(error.details[0].message);

		// Create a new product using the data from the request body
		const seller = {
			name: req.payload.name.first,
			slug: req.payload.slug,
			user: req.payload._id,
			imageUrl: req.payload.image.url,
		};

		const product = new Products({
			...dataToValidate,
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

// Get spicific product by id
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
		const product = await Products.findById(req.params.productId);
		if (!product) return res.status(404).send("Product not found");

		// Authorization
		if (req.payload.slug !== product.seller.slug) {
			return res.status(403).send("Access denied. You can't update this product");
		}

		// Prevent updating protected fields
		delete req.body._id;
		delete req.body.category;
		delete req.body.type;
		delete req.body.seller;
		delete req.body.likes;

		// Get dynamic schema based on existing product
		const schema = getProductSchema(product.category, product.type);

		// Make schema optional (for update)
		const updateSchema = schema.fork(Object.keys(schema.describe().keys), (field) =>
			field.optional(),
		);

		const {error} = updateSchema.validate(req.body, {
			abortEarly: true,
			allowUnknown: false,
		});

		if (error) return res.status(400).send(error.details[0].message);

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
// router.delete("/:productId", auth, async (req, res) => {
// 	const {productId} = req.params;
// 	try {
// 		let findProduct = await Products.findById(productId);
// 		if (!findProduct) return res.status(404).send("This product is not found");

// 		const canDelete =
// 			req.payload.role === "Admin" ||
// 			req.payload.role === "Moderator" ||
// 			req.payload.slug === findProduct.seller.slug;

// 		if (!canDelete) {
// 			return res
// 				.status(403)
// 				.send("Access denied. You don't have permission to delete this product");
// 		}

// 		if (findProduct.image && findProduct.image.publicId) {
// 			try {
// 				const result = await cloudinary.uploader.destroy(
// 					findProduct.image.publicId,
// 				);

// 				if (result.result !== "ok" && result.result !== "not found") {
// 					throw new Error(
// 						`Cloudinary Error: ${result.message || result.result}`,
// 					);
// 				}
// 				await Products.findByIdAndDelete(productId);
// 				res.status(200).send("The product has been deleted successfully");
// 			} catch (error) {
// 				console.error("Cloudinary Destruction Error:", error);
// 				res.status(500).send(error);
// 			}
// 		}
// 	} catch (error) {
// 		console.error("Delete Route Error:", error);
// 		res.status(500).send(error);
// 	}
// });

// router.delete("/:productId", auth, async (req, res) => {
// 	const {productId} = req.params;

// 	try {
// 		let findProduct = await Products.findById(productId);
// 		if (!findProduct) return res.status(404).send("This product is not found");

// 		const canDelete =
// 			req.payload.role === "Admin" ||
// 			req.payload.role === "Moderator" ||
// 			req.payload.slug === findProduct.seller.slug;

// 		if (!canDelete) {
// 			return res
// 				.status(403)
// 				.send("Access denied. You don't have permission to delete this product");
// 		}

// 		// حذف الصورة إذا موجودة
// 		if (findProduct.image?.publicId) {
// 			try {
// 				const result = await cloudinary.uploader.destroy(
// 					findProduct.image.publicId,
// 				);

// 				console.log("Cloudinary result:", result);

// 				if (result.result !== "ok" && result.result !== "not found") {
// 					console.warn("Cloudinary warning:", result);
// 				}
// 			} catch (cloudErr) {
// 				console.error("Cloudinary error:", cloudErr);
// 			}
// 		}

// 		// حذف المنتج دائمًا
// 		await Products.findByIdAndDelete(productId);

// 		res.status(200).send("The product has been deleted successfully");
// 	} catch (error) {
// 		console.error("Delete Route Error:", error);
// 		res.status(500).send(error.message);
// 	}
// });
router.delete("/:productId", auth, async (req, res) => {
	const {productId} = req.params;

	try {
		const findProduct = await Products.findById(productId);
		if (!findProduct) return res.status(404).send("This product is not found");

		const canDelete =
			req.payload.role === "Admin" ||
			req.payload.role === "Moderator" ||
			req.payload.slug === findProduct.seller.slug;

		if (!canDelete) {
			return res
				.status(403)
				.send("Access denied. You don't have permission to delete this product");
		}

		// 1. حذف الصورة أولاً (شرط أساسي)
		if (findProduct.image?.publicId) {
			const result = await cloudinary.uploader.destroy(findProduct.image.publicId);

			console.log("Cloudinary result:", result);

			// إذا فشل الحذف → نوقف العملية
			if (result.result !== "ok" && result.result !== "not found") {
				return res.status(500).send("Failed to delete image from Cloudinary");
			}
		}

		// 2. حذف المنتج فقط إذا نجح حذف الصورة
		await Products.findByIdAndDelete(productId);

		return res.status(200).send("The product has been deleted successfully");
	} catch (error) {
		console.error("Delete Route Error:", error);
		return res.status(500).send(error.message);
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
