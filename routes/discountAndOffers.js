const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { disconnect } = require("mongoose");

router.get("/", async (req, res) => {
	try {
		const discounts = await Product.aggregate([
			{$match: {sale: true}},
			{$sort: {updatedAt: 1, product_name: 1}},
			{$limit: 40},
		]);
		if (!discounts) return res.status(404).send("no products on discounts");

		res.status(200).send(discounts);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
