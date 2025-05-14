const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const auth = require("../middlewares/auth");
const {createOrder} = require("../controllers/orderController");

router.post("/", auth, async (req, res, next) => {
	try {
		req.io = req.app.get("io");
		await createOrder(req, res, next);

		// Update the products in stock
		for (const item of req.body.cartItems) {
			const product = await Product.findOneAndUpdate(
				{product_name: item.product_name},
				{$inc: {quantity_in_stock: -item.quantity}},
				{new: true},
			);

			req.io.emit("product:quantity_in_stock", {
				product_name: product.product_name,
				quantity_in_stock: product.quantity_in_stock,
			});
		}
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Get all orders for admin and moderator
router.get("/", auth, async (req, res) => {
	try {
		const isAdminOrModerator =
			req.payload.role === "Admin" || req.payload.role === "Moderator";

		if (!isAdminOrModerator) {
			return res
				.status(403)
				.send("You do not have permission to access these orders.");
		}
		const orders = await Order.find();

		return res.status(200).send(orders);
	} catch (error) {
		return res.status(500).send("Server error while fetching orders.");
	}
});

// patch order status and send emit
router.patch("/:orderNumber", auth, async (req, res) => {
	try {
		if (req.payload.role !== "Admin" && req.payload.role !== "Moderator")
			return res
				.status(403)
				.send("You are not authorized to update the order status");

		// Find the order and update
		const order = await Order.findOneAndUpdate(
			{orderNumber: req.params.orderNumber},
			{$set: {status: req.body.status}},
			{new: true},
		);
		if (!order) return res.status(404).send("Order not found");

		const io = req.app.get("io");
		io.to(order.userId.toString()).emit("order:status:client", {
			orderNumber: order.orderNumber,
			status: order.status,
		});

		// Return success status
		res.status(200).send(order);
	} catch (error) {
		return res.status(500).send("Server error while updating the order.");
	}
});

router.get("/details/:orderNumber", auth, async (req, res) => {
	try {
		const orderNumber = req.params.orderNumber;

		// Find the order and update
		const order = await Order.findOne({orderNumber: orderNumber});
		if (!order) return res.status(404).send("Order not found");

		// Return success status
		res.status(200).send(order);
	} catch (error) {
		return res.status(500).send("Server error while Retrieve order items.");
	}
});

// Get orders for a specific user
router.get("/:userId", auth, async (req, res) => {
	try {
		const {userId} = req.params;

		const isAdminOrSelf = req.payload.role === "Admin" || req.payload._id === userId;

		if (!isAdminOrSelf)
			return res
				.status(401)
				.send("You do not have permission to access these orders.");

		// Retrieve all orders for the user
		const orders = await Order.find({userId: userId}).sort({createdAt: 1});

		res.status(200).send(orders);
	} catch (error) {
		res.status(500).send("Server error while fetching orders.");
	}
});

module.exports = router;
