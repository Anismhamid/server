const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middlewares/auth");
const {createOrder} = require("../controllers/orderController");

router.post("/", auth, (req, res, next) => {
	req.io = req.app.get("io");
	createOrder(req, res, next);
});

// Get orders for a specific user
router.get("/:userId", auth, async (req, res) => {
	try {
		const {userId} = req.params;

		if (req.payload.role !== "Admin" && req.payload._id !== userId)
			return res
				.status(401)
				.send("You do not have permission to access these orders.");

		// Retrieve all orders for the user
		const orders = await Order.find({userId: userId}).sort({createdAt: 1});

		res.status(200).send(orders);
	} catch (error) {
		console.error(error);
		res.status(500).send("Server error while fetching orders.");
	}
});

// Get all orders for admin and moderator
router.get("/", auth, async (req, res) => {
	try {
		if (req.payload.role !== "Admin" && req.payload.role !== "Moderator") {
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

// patch status
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

		io.on("connection", (socket) => {
			const userId = socket.handshake.auth?.userId;
			if (userId) {
				socket.join(userId);
			}
		});

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

module.exports = router;
