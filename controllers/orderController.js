// controllers/orderController.js
const orderSchema = require("../schema/order");
const Order = require("../models/Order");
const Carts = require("../models/Cart");
const Receipt = require("../models/Receipt");
const Users = require("../models/User");

const generateOrderNumber = async () => {
	let randomOrderNumber = `ORD-${Math.floor(Math.random() * 100000)}`;
	const orderExists = await Order.findOne({orderNumber: randomOrderNumber});
	return orderExists ? generateOrderNumber() : randomOrderNumber;
};

exports.createOrder = async (req, res) => {
	try {
		const {error} = orderSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const {products, deliveryFee, totalAmount} = req.body;
		if (!products) return res.status(400).send("No products provided for the order.");

		const orderNumber = await generateOrderNumber();

		const newOrder = new Order({
			...req.body,
			userId: req.payload._id,
			orderNumber,
			deliveryFee,
			totalAmount,
		});

		await newOrder.save();

		const cart = await Carts.findOne({userId: req.payload._id});
		cart.products = [];
		await cart.save()

		req.io.emit("new order", newOrder);

		const user = await Users.findOne({_id: req.payload._id});
		const order = await Order.findOne({orderNumber: orderNumber});

		const newReceipt = new Receipt({
			businessInfo: {
				name: "שוק הפינה פירות ירקות ועוד",
				phone: "0538346915",
				email: "support@fruitsandveg.com",
				address: "שדרות ירושלים 45, תל אביב",
			},
			customer: {
				name: {first: user.name.first, last: user.name.last},
				email: user.email,
				phone: {
					phone_1: user.phone.phone_1,
					phone_2: user.phone.phone_2,
				},
				address: {
					city: user.address.city,
					street: user.address.street,
					houseNumber: user.address.houseNumber,
				},
			},
			orderNumber: order.orderNumber,
			orderDate: order.createdAt,
			products: order.products,
			deliveryFee: order.deliveryFee,
			totalAmount: order.totalAmount,
			discount: order.discount,
			payment: order.payment,
			userId: user._id,
		});

		await newReceipt.save();

		return res.status(201).send(newOrder);
	} catch (error) {
		return res.status(400).send(error.message);
	}
};
